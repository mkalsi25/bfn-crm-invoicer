import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./routes/non-protected/layout.tsx", [
    index("./routes/non-protected/routes/sign-in.tsx"),
    route("invitation", "./routes/non-protected/routes/sign-up.tsx"),
  ]),
  layout("./routes/dashboard/layout.tsx", [
    route("dashboard", "./routes/dashboard/routes/home.tsx", { id: "main" }),
    route("dashboard/prediction", "./routes/dashboard/routes/predict.tsx"),
    // route("dashboard/clients", "./routes/dashboard/routes/client.tsx"),
  ]),
] satisfies RouteConfig;
