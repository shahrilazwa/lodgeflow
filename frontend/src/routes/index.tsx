import { createBrowserRouter } from 'react-router-dom'
import ProtectedLayout from '@/components/ProtectedLayout'
import PublicLayout from '@/components/PublicLayout'

// Public pages
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'

// Protected pages
import DashboardPage from '@/features/dashboard/DashboardPage'
import PropertiesPage from '@/features/properties/PropertiesPage'
import UnitsPage from '@/features/units/UnitsPage'
import GuestsPage from '@/features/guests/GuestsPage'
import BookingsPage from '@/features/bookings/BookingsPage'
import PaymentsPage from '@/features/payments/PaymentsPage'
import ExpensesPage from '@/features/expenses/ExpensesPage'
import ServiceProvidersPage from '@/features/service-providers/ServiceProvidersPage'
import CleaningTasksPage from '@/features/cleaning-tasks/CleaningTasksPage'
import MaintenanceTasksPage from '@/features/maintenance-tasks/MaintenanceTasksPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/properties', element: <PropertiesPage /> },
      { path: '/units', element: <UnitsPage /> },
      { path: '/guests', element: <GuestsPage /> },
      { path: '/bookings', element: <BookingsPage /> },
      { path: '/payments', element: <PaymentsPage /> },
      { path: '/expenses', element: <ExpensesPage /> },
      { path: '/service-providers', element: <ServiceProvidersPage /> },
      { path: '/cleaning-tasks', element: <CleaningTasksPage /> },
      { path: '/maintenance-tasks', element: <MaintenanceTasksPage /> },
    ],
  },
])
