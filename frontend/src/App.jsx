import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";

// Machine Queue Pages
import MachineList from "./pages/machine-queue/MachineList";
import MachineDetail from "./pages/machine-queue/MachineDetail";
import QueueManagement from "./pages/machine-queue/QueueManagement";
import QueueForm from "./pages/machine-queue/QueueForm";
import MachineForm from "./pages/machine-queue/MachineForm";

// Production Management Pages
import ProductionRequests from "./pages/production-management/ProductionRequests";
import ProductionRequestDetail from "./pages/production-management/ProductionRequestDetail";
import ProductionBatches from "./pages/production-management/ProductionBatches";
import ProductionBatchDetail from "./pages/production-management/ProductionBatchDetail";
import ProductionBatchForm from "./pages/production-management/ProductionBatchForm";
import ProductionRequestForm from "./pages/production-management/ProductionRequestForm";

// Material Inventory Pages
import MaterialList from "./pages/material-inventory/MaterialList";
import MaterialDetail from "./pages/material-inventory/MaterialDetail";
import SupplierList from "./pages/material-inventory/SupplierList";
import SupplierDetail from "./pages/material-inventory/SupplierDetail";
import TransactionHistory from "./pages/material-inventory/TransactionHistory";
import CreateMaterial from "./pages/material-inventory/CreateMaterial";
import EditMaterial from "./pages/material-inventory/EditMaterial";
import CreateSupplier from "./pages/material-inventory/CreateSupplier";
import EditSupplier from "./pages/material-inventory/EditSupplier";
import PurchaseMaterial from "./pages/material-inventory/PurchaseMaterial";

// Production Planning Pages
import ProductionPlans from "./pages/planning/ProductionPlans";
import ProductionPlanDetail from "./pages/planning/ProductionPlanDetail";
import ProductionPlanForm from "./pages/planning/ProductionPlanForm";

// Production Feedback Pages
import { 
  FeedbackList, 
  ProductionFeedbackForm, 
  EditProductionFeedbackForm,
  QuantityStockList,
  QuantityStockForm 
} from "./pages/production-feedback";

// User Management Pages
import UserManagement from "./pages/user/UserManagement";
import UserProfile from "./pages/profile/Profile";

// Auth Guard Component
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            {/* Machine Queue */}
            <Route path="/machines" element={<MachineList />} />
            <Route path="/machines/add" element={<MachineForm />} />
            <Route path="/machines/:id" element={<MachineDetail />} />
            <Route path="/machines/:id/edit" element={<MachineForm />} />
            <Route path="/queue" element={<QueueManagement />} />
            <Route path="/queue/add" element={<QueueForm />} />
            <Route path="/queue/:id/edit" element={<QueueForm />} />
            {/* Production Management Routes */}
            <Route
              path="/production-requests/add"
              element={<ProductionRequestForm />}
            />
            <Route
              path="/production-requests/:id/edit"
              element={<ProductionRequestForm />}
            />
            <Route
              path="/production-requests/:id"
              element={<ProductionRequestDetail />}
            />
            <Route
              path="/production-requests"
              element={<ProductionRequests />}
            />
            <Route path="/production-batches" element={<ProductionBatches />} />
            <Route
              path="/production-batches/add"
              element={<ProductionBatchForm />}
            />
            <Route
              path="/production-batches/:id"
              element={<ProductionBatchDetail />}
            />
            <Route
              path="/production-batches/:id/edit"
              element={<ProductionBatchForm />}
            />
            {/* Material Inventory Routes */}
            <Route path="/materials" element={<MaterialList />} />
            <Route path="/materials/new" element={<CreateMaterial />} />
            <Route path="/materials/purchase" element={<PurchaseMaterial />} />
            <Route path="/materials/:id" element={<MaterialDetail />} />
            <Route path="/materials/:id/edit" element={<EditMaterial />} />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/new" element={<CreateSupplier />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />
            <Route path="/suppliers/:id/edit" element={<EditSupplier />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            {/* Production Planning Routes */}
            <Route path="/production-plans" element={<ProductionPlans />} />
            <Route
              path="/production-plans/create"
              element={<ProductionPlanForm />}
            />
            <Route
              path="/production-plans/:id"
              element={<ProductionPlanDetail />}
            />
            <Route
              path="/production-plans/:id/edit"
              element={<ProductionPlanForm />}
            />
           
            {/* Production Feedback Routes */}
            <Route path="/feedback" element={<FeedbackList />} />
            <Route path="/feedback/create" element={<ProductionFeedbackForm />} />
            <Route path="/feedback/edit/:id" element={<EditProductionFeedbackForm />} />
            
            {/* Quantity Stock Routes */}
            <Route path="/feedback/quantity-stock" element={<QuantityStockList />} />
            <Route path="/feedback/quantity-stock/create" element={<QuantityStockForm />} />
            <Route path="/feedback/quantity-stock/edit/:id" element={<QuantityStockForm />} />
           
            {/* User Management Routes */}
            <Route path="/users" element={<UserManagement />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
