import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
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
import InvoiceDetailsPage from "./pages/Invoices/InvoicesPage";
import InvoiceCreatePage from "./pages/Invoices/InvoiceCreatePage";
import RequireAuth from "./components/auth/RequireAuth";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/contracts/new" element={<ContractCreatePage />} />
              <Route
                path="/contracts/:id/edit"
                element={<ContractEditPage />}
              />
              <Route path="/contracts/:id" element={<ContractDetailsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/templates/new" element={<TemplateCreatePage />} />
              <Route
                path="/templates/:id/edit"
                element={<TemplateEditPage />}
              />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/new" element={<ClientCreatePage />} />
              <Route path="/clients/:id" element={<ClientDetailsPage />} />
              <Route path="/clients/:id/edit" element={<ClientEditPage />} />

              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/invoices/new" element={<InvoiceCreatePage />} />
              <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>
          {/* Dashboard Layout */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
