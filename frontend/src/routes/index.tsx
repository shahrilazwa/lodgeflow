import { createBrowserRouter } from 'react-router-dom'
import ProtectedLayout from '@/components/ProtectedLayout'
import PublicLayout from '@/components/PublicLayout'

// Public pages
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'

// Protected pages
import DashboardPage from '@/features/dashboard/DashboardPage'
import PropertiesPage from '@/features/properties/PropertiesPage'
import PropertyDetailPage from '@/features/properties/PropertyDetailPage'
import PropertyFormPage from '@/features/properties/PropertyFormPage'
import UnitsPage from '@/features/units/UnitsPage'
import UnitDetailPage from '@/features/units/UnitDetailPage'
import UnitFormPage from '@/features/units/UnitFormPage'
import GuestsPage from '@/features/guests/GuestsPage'
import GuestDetailPage from '@/features/guests/GuestDetailPage'
import GuestFormPage from '@/features/guests/GuestFormPage'
import BookingsPage from '@/features/bookings/BookingsPage'
import BookingDetailPage from '@/features/bookings/BookingDetailPage'
import BookingFormPage from '@/features/bookings/BookingFormPage'
import PaymentsPage from '@/features/payments/PaymentsPage'
import ExpensesPage from '@/features/expenses/ExpensesPage'
import ExpenseFormPage from '@/features/expenses/ExpenseFormPage'
import ServiceProvidersPage from '@/features/service-providers/ServiceProvidersPage'
import ServiceProviderFormPage from '@/features/service-providers/ServiceProviderFormPage'
import CleaningTasksPage from '@/features/cleaning-tasks/CleaningTasksPage'
import MaintenanceTasksPage from '@/features/maintenance-tasks/MaintenanceTasksPage'
import MaintenanceTaskFormPage from '@/features/maintenance-tasks/MaintenanceTaskFormPage'

import LandingPage from '@/features/landing/LandingPage'

export const router = createBrowserRouter([
  // Public landing page (no layout wrapper — standalone)
  {
    path: '/',
    element: <LandingPage />,
  },
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
      { path: '/dashboard', element: <DashboardPage /> },

      // Properties
      { path: '/properties', element: <PropertiesPage /> },
      { path: '/properties/create', element: <PropertyFormPage /> },
      { path: '/properties/:id', element: <PropertyDetailPage /> },
      { path: '/properties/:id/edit', element: <PropertyFormPage /> },

      // Units (nested under property)
      { path: '/properties/:propertyId/units', element: <UnitsPage /> },
      { path: '/properties/:propertyId/units/create', element: <UnitFormPage /> },

      // Units (standalone)
      { path: '/units', element: <UnitsPage /> },
      { path: '/units/:id', element: <UnitDetailPage /> },
      { path: '/units/:id/edit', element: <UnitFormPage /> },

      // Guests
      { path: '/guests', element: <GuestsPage /> },
      { path: '/guests/create', element: <GuestFormPage /> },
      { path: '/guests/:id', element: <GuestDetailPage /> },
      { path: '/guests/:id/edit', element: <GuestFormPage /> },

      // Bookings
      { path: '/bookings', element: <BookingsPage /> },
      { path: '/bookings/create', element: <BookingFormPage /> },
      { path: '/bookings/:id', element: <BookingDetailPage /> },
      { path: '/bookings/:id/edit', element: <BookingFormPage /> },

      // Payments (managed from booking detail page)
      { path: '/payments', element: <PaymentsPage /> },

      // Expenses
      { path: '/expenses', element: <ExpensesPage /> },
      { path: '/expenses/create', element: <ExpenseFormPage /> },
      { path: '/expenses/:id/edit', element: <ExpenseFormPage /> },

      // Service Providers
      { path: '/service-providers', element: <ServiceProvidersPage /> },
      { path: '/service-providers/create', element: <ServiceProviderFormPage /> },
      { path: '/service-providers/:id/edit', element: <ServiceProviderFormPage /> },

      // Cleaning Tasks
      { path: '/cleaning-tasks', element: <CleaningTasksPage /> },

      // Maintenance Tasks
      { path: '/maintenance-tasks', element: <MaintenanceTasksPage /> },
      { path: '/maintenance-tasks/create', element: <MaintenanceTaskFormPage /> },
      { path: '/maintenance-tasks/:id/edit', element: <MaintenanceTaskFormPage /> },
    ],
  },
])
