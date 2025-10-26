import { DataFrame } from "data-forge";
import { differenceInMonths, format } from "date-fns";
import { ofetch } from "ofetch";
import type {
  LoaderFnProps,
  UCRMClient,
  UCRMInvoice,
  UCRMService,
  UCRMServicePlan,
} from "~/types";

export const UCRMHeader = (token: string) => ({
  "X-Auth-App-Key": token,
  "Content-Type": "application/json",
});

const baseURL = "https://clients.befreenetworks.es/api/v1.0";

const ucrm = ofetch.create({ baseURL });

export const getAllInvoices = async (
  token: string,
  query?: Record<string, string>
) => {
  return ucrm<UCRMInvoice[]>(`/invoices`, {
    method: "GET",
    headers: UCRMHeader(token),
    query,
  });
};

export const getAllClients = async (
  token: string,
  query?: Record<string, string>
) => {
  return ucrm<UCRMClient[]>(`/clients`, {
    method: "GET",
    headers: UCRMHeader(token),
    query,
  });
};

export const getAllServices = async (
  token: string,
  query?: Record<string, string>
) => {
  return ucrm<UCRMService[]>(`/clients/services?statuses[]=1&statuses[]=7`, {
    method: "GET",
    headers: UCRMHeader(token),
    query,
  });
};

export const getAllServicePlans = async (
  token: string,
  query?: Record<string, string>
) => {
  return ucrm<UCRMServicePlan[]>(`/service-plans`, {
    method: "GET",
    headers: UCRMHeader(token),
    query,
  });
};

export const getFutureInvoices = async ({
  token,
  date: { from, to },
}: LoaderFnProps) => {
  const totalmonth = differenceInMonths(to, from);

  const servicesPromise = getAllServices(token!, {
    status: "1",
    limit: "399",
  });

  const clientPromise = getAllClients(token!);

  const activeClients = clientPromise.then((clients) =>
    servicesPromise.then((services) =>
      new DataFrame(clients)
        .select((client) => {
          return {
            ...client,
            hasServices: services.some(
              (service) => service.clientId === client.id
            ),
            activeServices: services.filter(
              (service) => service.clientId === client.id
            ),
          };
        })
        .filter((i) => i.hasServices)
        .toArray()
    )
  );

  const expectedRevenue = activeClients.then((clients) =>
    new DataFrame(clients)
      .select((client) => {
        const pricing = new DataFrame(client.activeServices).select((item) => {
          const billingCycles = Math.floor(totalmonth / item.servicePlanPeriod);
          return {
            planId: item.servicePlanId,
            price: item.servicePlanPrice,
            period: item.servicePlanPeriod,
            amount: item.servicePlanPrice * billingCycles,
            months: billingCycles,
          };
        });

        return {
          name: client.companyName || `${client.firstName} ${client.lastName}`,
          activeServices: client.activeServices,
          pricing: pricing.toArray(),
          amountToPay: pricing.deflate((item) => item.amount).sum(),
          months: totalmonth,
        };
      })

      .toArray()
  );

  const totalExpectedRevenue = expectedRevenue.then((pricies) =>
    new DataFrame(pricies).deflate((i) => i.amountToPay).sum()
  );

  const servicePlans = getAllServicePlans(token!);

  return {
    activeClients,
    servicePlans,
    totalExpectedRevenue,
    expectedRevenue,
    noOfClient: activeClients.then((i) => i.length),
    noOfServicePlan: servicePlans.then((i) => i.length),
    noOfActiveServices: servicesPromise.then((i) => i.length),
  };
};

export const getDataForDashboard = async ({
  date: { from, to },
  token,
}: LoaderFnProps) => {
  const clients = await getAllClients(token!);

  const servicesPromise = getAllServices(token!, {
    status: "1",
    limit: "399",
  }).then((services) =>
    services.map((service) => ({
      ...service,
      client: clients.find((client) => client.id === service.clientId),
    }))
  );

  const services = await servicesPromise;

  const activeClients = clients
    .map((client) => ({
      ...client,
      hasServices: services.some((service) => service.clientId === client.id),
      activeServices: services.filter(
        (service) => service.clientId === client.id
      ),
    }))
    .filter((i) => i.hasServices);

  const invoices = getAllInvoices(token!, {
    createdDateFrom: format(from, "yyyy-MM-dd"),
    createdDateTo: format(to, "yyyy-MM-dd"),
  }).then((invoices) =>
    invoices.map((invoice) => ({
      ...invoice,
      client: clients.find((client) => client.id === invoice.clientId),
    }))
  );

  const clientPromise = getAllClients(token!);

  const groupInvoices = invoices.then((invoices) =>
    new DataFrame(invoices)
      .groupBy((i) => i.clientId)
      .select((group) => {
        const amountPaid = group.deflate((i) => i.amountPaid).sum();
        const amountToPay = group.deflate((i) => i.amountToPay).sum();

        return {
          clientId: group.first().clientId,
          client: group.first().client,
          amountPaid,
          amountToPay,
          totalInvoices: group.count(),
          status: amountToPay === 0 ? 3 : 1,
        };
      })
      .orderBy((i) => i.clientId)
      .toArray()
  );

  const totalRevenue = groupInvoices.then((invoices) =>
    new DataFrame(invoices).deflate((item) => item.amountPaid).sum()
  );
  const pendingAmount = groupInvoices.then((invoices) =>
    new DataFrame(invoices).deflate((item) => item.amountToPay).sum()
  );

  return {
    invoices,
    groupInvoices,
    noOfInvoices: invoices.then((i) => i.length),
    totalRevenue,
    pendingAmount,
    clients: clientPromise,
    noOfClient: clientPromise.then((i) => i.length),
    services: servicesPromise,
    noOfServices: servicesPromise.then((i) => i.length),
    activeClients,
  };
};
