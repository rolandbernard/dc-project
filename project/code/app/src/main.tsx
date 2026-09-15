import { StrictMode } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { createRoot } from "react-dom/client";

import Root from "./page/Root";
import HomePage from "./page/HomePage";
import ErrorPage from "./page/ErrorPage";
import QueryPage from "./page/QueryPage";
import ObjectPage from "./page/ObjectPage";

import "./styles.css";

const router = createBrowserRouter([
    {
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "/query", element: <QueryPage /> },
            { path: "/object/:kind/:id", element: <ObjectPage /> },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
