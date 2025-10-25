import { DataFrame } from "data-forge";
import { format } from "date-fns";
import { ofetch } from "ofetch";
import type { UCRMClient, UCRMInvoice, UCRMService } from "~/types";

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

export const getDataForDashboard = async ({
  dateBeforeSixMonth,
  token,
}: {
  dateBeforeSixMonth: Date;
  token: string;
}) => {
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
    createdDateFrom: format(dateBeforeSixMonth, "yyyy-MM-dd"),
    createdDateTo: format(new Date(), "yyyy-MM-dd"),
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
