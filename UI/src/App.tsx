import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

import RequireAuth from "./components/auth/RequireAuth";
import RequireOrg from "./components/auth/RequireOrg";

import Home from "./pages/Dashboard/Home";
import ProfilePage from "./pages/Profile/ProfilePage";

import ContractsPage from "./pages/Contracts/ContractsPage";
import ContractCreatePage from "./pages/Contracts/ContractCreatePage";
import ContractEditPage from "./pages/Contracts/ContractEditPage";
import ContractDetailsPage from "./pages/Contracts/ContractDetailsPage";

import TemplatesPage from "./pages/Templates/TemplatesPage";
import TemplateCreatePage from "./pages/Templates/TemplateCreatePage";
import TemplateEditPage from "./pages/Templates/TemplateEditPage";

import ClientsPage from "./pages/Clients/ClientsPage";
import ClientCreatePage from "./pages/Clients/ClientCreatePage";
import ClientEditPage from "./pages/Clients/ClientEditPage";
import ClientDetailsPage from "./pages/Clients/ClientDetailsPage";

import InvoicesPage from "./pages/Invoices/InvoicesPage";
import InvoiceCreatePage from "./pages/Invoices/InvoiceCreatePage";
import InvoiceDetailsPage from "./pages/Invoices/InvoiceDetailsPage";
import OrgSetupPage from "./pages/Onboarding/OrgSetupPage";
import InviteAcceptPage from "./pages/Invites/InviteAcceptPage";
import { TokenBootstrap } from "./components/auth/TokenBootstrap";
import OrgGate from "./components/OrgGate";

export default function App() {
  return (
    <>
      <TokenBootstrap />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Must be authenticated for everything (your backend requires JWT for /api) */}
          <Route element={<RequireAuth />}>
            {/* These routes must work without org */}
            <Route path="/onboarding/org" element={<OrgSetupPage />} />
            <Route path="/invite/:token" element={<InviteAcceptPage />} />

            {/* Everything else requires org */}
            <Route element={<RequireOrg />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<Home />} />

                <Route
                  path="/contracts"
                  element={
                    <OrgGate fallbackTo="/profile">
                      <ContractsPage />
                    </OrgGate>
                  }
                />
                <Route path="/contracts/new" element={<ContractCreatePage />} />
                <Route
                  path="/contracts/:id/edit"
                  element={<ContractEditPage />}
                />
                <Route
                  path="/contracts/:id"
                  element={<ContractDetailsPage />}
                />

                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/templates/new" element={<TemplateCreatePage />} />
                <Route
                  path="/templates/:id/edit"
                  element={<TemplateEditPage />}
                />

                <Route
                  path="/clients"
                  element={
                    <OrgGate fallbackTo="/profile">
                      <ClientsPage />
                    </OrgGate>
                  }
                />
                <Route path="/clients/new" element={<ClientCreatePage />} />
                <Route path="/clients/:id" element={<ClientDetailsPage />} />
                <Route path="/clients/:id/edit" element={<ClientEditPage />} />

                <Route
                  path="/invoices"
                  element={
                    <OrgGate fallbackTo="/profile">
                      <InvoicesPage />
                    </OrgGate>
                  }
                />
                <Route path="/invoices/new" element={<InvoiceCreatePage />} />
                <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />

                {/* Others */}
                <Route path="/profile" element={<ProfilePage />} />
                {/* <Route path="/calendar" element={<Calendar />} />
                <Route path="/blank" element={<Blank />} />
                <Route path="/form-elements" element={<FormElements />} />
                <Route path="/basic-tables" element={<BasicTables />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} /> */}
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
