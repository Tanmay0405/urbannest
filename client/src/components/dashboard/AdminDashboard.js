import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingActionId, setBookingActionId] = useState("");
  const [propertyActionId, setPropertyActionId] = useState("");

  const token = localStorage.getItem("jwtoken");
  const userType = localStorage.getItem("userType");

  const config = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const handleUnauthorized = useCallback(
    (err) => {
      if (err.response?.status !== 401) {
        return false;
      }

      localStorage.removeItem("jwtoken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      localStorage.removeItem("userEmail");

      navigate("/login", { replace: true });

      return true;
    },
    [navigate],
  );

  useEffect(() => {
    if (!token || userType !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [navigate, token, userType]);

  const loadAdminData = useCallback(async () => {
    if (!token || userType !== "admin") {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [propertiesResponse, bookingsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_SERVER_URL}/properties`, {
          params: {
            status: "",
            page: 1,
            limit: 100,
          },
          ...config,
        }),

        axios.get(`${process.env.REACT_APP_SERVER_URL}/admin/bookings`, config),
      ]);

      setProperties(propertiesResponse.data?.properties || []);
      setBookings(bookingsResponse.data?.bookings || []);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);

      if (handleUnauthorized(err)) {
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [config, handleUnauthorized, token, userType]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setBookingActionId(bookingId);
      setError("");

      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_URL}/admin/bookings/${bookingId}/status`,
        {
          status,
        },
        config,
      );

      const updatedBooking = response.data?.booking;

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? updatedBooking || { ...booking, status }
            : booking,
        ),
      );
    } catch (err) {
      console.error("Failed to update booking:", err);

      if (handleUnauthorized(err)) {
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update booking.",
      );
    } finally {
      setBookingActionId("");
    }
  };

  const deactivateProperty = async (propertyId) => {
    const confirmed = window.confirm(
      "Deactivate this property? It will no longer be publicly available.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setPropertyActionId(propertyId);
      setError("");

      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/properties/${propertyId}`,
        {
          status: "inactive",
        },
        config,
      );

      const updatedProperty = response.data?.property;

      setProperties((currentProperties) =>
        currentProperties.map((property) =>
          property._id === propertyId
            ? updatedProperty || { ...property, status: "inactive" }
            : property,
        ),
      );
    } catch (err) {
      console.error("Failed to deactivate property:", err);

      if (handleUnauthorized(err)) {
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to deactivate property.",
      );
    } finally {
      setPropertyActionId("");
    }
  };

  const stats = {
    properties: properties.length,

    activeProperties: properties.filter(
      (property) => property.status === "active",
    ).length,

    inactiveProperties: properties.filter(
      (property) => property.status === "inactive",
    ).length,

    soldProperties: properties.filter((property) => property.status === "sold")
      .length,

    bookings: bookings.length,

    pendingBookings: bookings.filter((booking) => booking.status === "pending")
      .length,

    approvedBookings: bookings.filter(
      (booking) => booking.status === "approved",
    ).length,
  };

  const formatCurrency = (value) => {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "₹0";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getBookingStatusClasses = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

      case "rejected":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";

      case "cancelled":
        return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

      case "completed":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

      case "pending":
      default:
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    }
  };

  const getPropertyStatusClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

      case "sold":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

      case "inactive":
      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }
  };

  if (!token || userType !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 sm:px-8">
              <div className="h-3 w-32 rounded bg-slate-700" />
              <div className="mt-4 h-10 w-72 max-w-full rounded bg-slate-700" />
              <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-700" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>

            <div className="mt-10 h-96 rounded-2xl border border-slate-200 bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 shadow-xl sm:px-8 sm:py-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold tracking-[0.25em] text-indigo-300">
                URBANNEST ADMIN
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Platform Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor marketplace activity, manage listings, and oversee
                booking requests.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={loadAdminData}
                className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                ↻ Refresh Data
              </button>

              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                View Marketplace
              </button>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={loadAdminData}
              className="w-fit rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="⌂"
            label="Total Properties"
            value={stats.properties}
            description="Listings across UrbanNest"
          />

          <StatCard
            icon="✓"
            label="Active Properties"
            value={stats.activeProperties}
            description="Currently visible"
          />

          <StatCard
            icon="◷"
            label="Total Bookings"
            value={stats.bookings}
            description="Marketplace booking activity"
          />

          <StatCard
            icon="!"
            label="Pending Bookings"
            value={stats.pendingBookings}
            description="Require attention"
          />
        </section>

        {/* Marketplace Summary */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon="●"
            label="Active Listings"
            value={stats.activeProperties}
            description="Publicly available"
            className="bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
          />

          <SummaryCard
            icon="○"
            label="Inactive Listings"
            value={stats.inactiveProperties}
            description="Not publicly available"
            className="bg-slate-100 text-slate-700 ring-1 ring-slate-200"
          />

          <SummaryCard
            icon="◆"
            label="Sold Properties"
            value={stats.soldProperties}
            description="Marked as sold"
            className="bg-blue-50 text-blue-800 ring-1 ring-blue-200"
          />
        </section>

        {/* Booking Management */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                  Booking Management
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor marketplace booking activity and manage pending
                  requests.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">
                  {stats.pendingBookings} pending
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">
                  {stats.approvedBookings} approved
                </span>
              </div>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600">
                ◷
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                No bookings found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Booking activity will appear here once buyers make requests.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <TableHeader>Property</TableHeader>
                      <TableHeader>Buyer</TableHeader>
                      <TableHeader>Dates</TableHeader>
                      <TableHeader>Amount</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Action</TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.slice(0, 10).map((booking) => {
                      const isProcessing = bookingActionId === booking._id;

                      return (
                        <tr
                          key={booking._id}
                          className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                        >
                          <TableCell>
                            <div className="max-w-[190px]">
                              <p className="truncate font-bold text-slate-900">
                                {booking.property?.title || "Property"}
                              </p>

                              {booking.property?.city && (
                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {booking.property.city}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {booking.buyer?.name ||
                                  booking.buyer?.email ||
                                  "Buyer"}
                              </p>

                              {booking.buyer?.email && booking.buyer?.name && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {booking.buyer.email}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs text-slate-600">
                              <p>
                                <span className="font-semibold text-slate-800">
                                  Start:
                                </span>{" "}
                                {formatDate(booking.startDate)}
                              </p>

                              <p className="mt-1">
                                <span className="font-semibold text-slate-800">
                                  End:
                                </span>{" "}
                                {formatDate(booking.endDate)}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-extrabold text-slate-900">
                              {formatCurrency(booking.amount)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <StatusBadge
                              status={booking.status}
                              className={getBookingStatusClasses(
                                booking.status,
                              )}
                            />
                          </TableCell>

                          <TableCell>
                            {booking.status === "pending" ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    updateBookingStatus(booking._id, "approved")
                                  }
                                  className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing ? "..." : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    updateBookingStatus(booking._id, "rejected")
                                  }
                                  className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing ? "..." : "Reject"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </TableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-4 p-4 md:hidden">
                {bookings.slice(0, 10).map((booking) => {
                  const isProcessing = bookingActionId === booking._id;

                  return (
                    <article
                      key={booking._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                            Property
                          </p>

                          <h3 className="mt-1 break-words text-sm font-extrabold text-slate-900">
                            {booking.property?.title || "Property"}
                          </h3>
                        </div>

                        <StatusBadge
                          status={booking.status}
                          className={getBookingStatusClasses(booking.status)}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                        <MobileInfo
                          label="Buyer"
                          value={
                            booking.buyer?.name ||
                            booking.buyer?.email ||
                            "Buyer"
                          }
                        />

                        <MobileInfo
                          label="Amount"
                          value={formatCurrency(booking.amount)}
                        />

                        <MobileInfo
                          label="Start"
                          value={formatDate(booking.startDate)}
                        />

                        <MobileInfo
                          label="End"
                          value={formatDate(booking.endDate)}
                        />
                      </div>

                      {booking.status === "pending" && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateBookingStatus(booking._id, "approved")
                            }
                            className="rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? "Processing..." : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateBookingStatus(booking._id, "rejected")
                            }
                            className="rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? "Processing..." : "Reject"}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Property Management */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                Property Management
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                Marketplace Properties
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review listings and deactivate properties when necessary.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex w-fit items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Browse All Listings
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600">
                ⌂
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                No properties found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Marketplace listings will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {properties.slice(0, 12).map((property) => (
                <AdminPropertyCard
                  key={property._id}
                  property={property}
                  actionLoading={propertyActionId === property._id}
                  onDeactivate={deactivateProperty}
                  formatCurrency={formatCurrency}
                  getStatusClasses={getPropertyStatusClasses}
                />
              ))}
            </div>
          )}

          {properties.length > 12 && (
            <div className="mt-5 text-center">
              <Link
                to="/properties"
                className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                View All {properties.length} Properties
              </Link>
            </div>
          )}
        </section>

        {/* Footer summary */}
        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing up to {Math.min(bookings.length, 10)} recent bookings and{" "}
            {Math.min(properties.length, 12)} properties.
          </span>

          <Link
            to="/properties"
            className="font-bold text-indigo-600 transition hover:text-indigo-700"
          >
            Open marketplace →
          </Link>
        </div>
      </div>
    </main>
  );
};

const StatCard = ({ icon, label, value, description }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600">
        {icon}
      </div>

      <div className="min-w-0">
        <span className="block text-xs font-semibold text-slate-500">
          {label}
        </span>

        <strong className="mt-0.5 block text-2xl font-extrabold text-slate-900">
          {value}
        </strong>

        <span className="mt-0.5 block truncate text-[11px] text-slate-400">
          {description}
        </span>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, description, className }) => {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl px-5 py-4 ${className}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-sm font-bold">
        {icon}
      </div>

      <div className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>

        <div className="mt-0.5 flex items-baseline gap-2">
          <strong className="text-2xl font-extrabold">{value}</strong>
          <span className="truncate text-xs opacity-70">{description}</span>
        </div>
      </div>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
};

const TableCell = ({ children }) => {
  return (
    <td className="px-4 py-4 align-middle text-sm text-slate-700">
      {children}
    </td>
  );
};

const StatusBadge = ({ status, className }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${className}`}
    >
      {status || "unknown"}
    </span>
  );
};

const MobileInfo = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <strong className="mt-1 block break-words text-sm text-slate-800">
        {value}
      </strong>
    </div>
  );
};

const AdminPropertyCard = ({
  property,
  actionLoading,
  onDeactivate,
  formatCurrency,
  getStatusClasses,
}) => {
  const [imageSrc, setImageSrc] = useState(
    property.images?.[0] || FALLBACK_IMAGE,
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={property.title || "Property"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={() => {
            if (imageSrc !== FALLBACK_IMAGE) {
              setImageSrc(FALLBACK_IMAGE);
            }
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${getStatusClasses(
            property.status,
          )}`}
        >
          {property.status || "active"}
        </span>

        <span className="absolute bottom-3 right-4 rounded-full bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          {property.propertyType || "Property"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-extrabold text-slate-900">
          {property.title || "Untitled Property"}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {property.location || "Location unavailable"}
          {property.city ? `, ${property.city}` : ""}
        </p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-100 bg-slate-50 py-3">
          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-800">
              {property.bedrooms || 0}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Beds
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-800">
              {property.bathrooms || 0}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Baths
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-800">
              {property.area || 0}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Sq. Ft.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Listed Price
            </p>

            <strong className="mt-0.5 block text-xl font-extrabold text-slate-900">
              {formatCurrency(property.price)}
            </strong>
          </div>

          <Link
            to={`/property/${property._id}`}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            View
          </Link>
        </div>

        {property.status === "active" && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onDeactivate(property._id)}
            className="mt-4 w-full rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading ? "Deactivating..." : "Deactivate Property"}
          </button>
        )}
      </div>
    </article>
  );
};

export default AdminDashboard;
