import { Fragment } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Exercise1 } from "./pages/Exercise1";
import { Exercise2 } from "./pages/Exercise2";
import "./styles/styles.css";

export function App() {
  const routes = [
    {
      path: "/exercise1",
      index: true,
      element: <Exercise1 />,
      errorElement: <h2>Page not found, please return.</h2>,
    },
    {
      path: "/exercise2",
      index: true,
      element: <Exercise2 />,
      errorElement: <h2>Page not found, please return.</h2>,
    },
  ];
  const router = createBrowserRouter(routes);

  return (
    <Fragment>
      <RouterProvider router={router} />
    </Fragment>
  );
}
