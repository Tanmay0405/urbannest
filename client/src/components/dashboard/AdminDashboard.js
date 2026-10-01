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

  const getBookingStatusClasses = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";

      case "rejected":
        return "bg-red-100 text-red-800";

      case "cancelled":
        return "bg-gray-100 text-gray-700";

      case "completed":
        return "bg-blue-100 text-blue-800";

      case "pending":
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const getPropertyStatusClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";

      case "sold":
        return "bg-blue-100 text-blue-800";

      case "inactive":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!token || userType !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-4 h-10 w-72 rounded bg-gray-200" />
            <div className="mt-3 h-5 w-96 max-w-full rounded bg-gray-200" />

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl border border-gray-200 bg-white"
                />
              ))}
            </div>

            <div className="mt-10 h-80 rounded-2xl border border-gray-200 bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-gray-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-indigo-600">
              URBANNEST ADMIN
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Platform Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Manage marketplace properties and monitor booking activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/properties")}
            className="inline-flex w-full items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 sm:w-auto"
          >
            View Marketplace
          </button>
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
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="⌂"
            label="Total Properties"
            value={stats.properties}
          />

          <StatCard
            icon="✓"
            label="Active Properties"
            value={stats.activeProperties}
          />

          <StatCard icon="◷" label="Total Bookings" value={stats.bookings} />

          <StatCard
            icon="!"
            label="Pending Bookings"
            value={stats.pendingBookings}
          />
        </section>

        {/* Marketplace Summary */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Active"
            value={stats.activeProperties}
            className="bg-green-50 text-green-800"
          />

          <SummaryCard
            label="Inactive"
            value={stats.inactiveProperties}
            className="bg-gray-100 text-gray-700"
          />

          <SummaryCard
            label="Sold"
            value={stats.soldProperties}
            className="bg-blue-50 text-blue-800"
          />
        </section>

        {/* Bookings */}
        <section className="mt-10 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div>
              <p className="text-xs font-extrabold tracking-[0.16em] text-indigo-600">
                BOOKING MANAGEMENT
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Monitor marketplace booking activity and manage pending
                requests.
              </p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600">
                ◷
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-gray-900">
                No bookings found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Booking activity will appear here once buyers make requests.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop/tablet */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <TableHeader>Property</TableHeader>
                      <TableHeader>Buyer</TableHeader>
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
                          className="border-b border-gray-100 last:border-0"
                        >
                          <TableCell>
                            <span className="font-bold text-gray-900">
                              {booking.property?.title || "Property"}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {booking.buyer?.name ||
                                  booking.buyer?.email ||
                                  "Buyer"}
                              </p>

                              {booking.buyer?.email && booking.buyer?.name && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {booking.buyer.email}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-bold text-gray-900">
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
                                  className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing ? "..." : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    updateBookingStatus(booking._id, "rejected")
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing ? "..." : "Reject"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </TableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-4 md:hidden">
                {bookings.slice(0, 10).map((booking) => {
                  const isProcessing = bookingActionId === booking._id;

                  return (
                    <article
                      key={booking._id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                            PROPERTY
                          </p>

                          <h3 className="mt-1 break-words text-sm font-extrabold text-gray-900">
                            {booking.property?.title || "Property"}
                          </h3>
                        </div>

                        <StatusBadge
                          status={booking.status}
                          className={getBookingStatusClasses(booking.status)}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 border-y border-gray-100 py-4">
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
                      </div>

                      {booking.status === "pending" && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateBookingStatus(booking._id, "approved")
                            }
                            className="rounded-lg bg-green-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? "Processing..." : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateBookingStatus(booking._id, "rejected")
                            }
                            className="rounded-lg bg-red-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Properties */}
        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <p className="text-xs font-extrabold tracking-[0.16em] text-indigo-600">
              PROPERTY MANAGEMENT
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
              Marketplace Properties
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review listings and deactivate properties when necessary.
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-xl bg-gray-50 px-5 py-12 text-center">
              <p className="text-sm font-semibold text-gray-500">
                No properties found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
        </section>

        {/* Footer summary */}
        <div className="mt-8 flex flex-col gap-2 border-t border-gray-200 pt-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing up to {Math.min(bookings.length, 10)} recent bookings and{" "}
            {Math.min(properties.length, 12)} properties.
          </span>

          <Link
            to="/properties"
            className="font-bold text-indigo-600 hover:text-indigo-700"
          >
            Open marketplace →
          </Link>
        </div>
      </div>
    </main>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600">
        {icon}
      </div>

      <div>
        <span className="block text-xs font-medium text-gray-500">{label}</span>

        <strong className="mt-0.5 block text-2xl font-extrabold text-gray-900">
          {value}
        </strong>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, className }) => {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-3 ${className}`}
    >
      <span className="text-sm font-bold">{label}</span>
      <strong className="text-lg">{value}</strong>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  );
};

const TableCell = ({ children }) => {
  return (
    <td className="px-4 py-4 align-middle text-sm text-gray-700">{children}</td>
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
      <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <strong className="mt-1 block break-words text-sm text-gray-800">
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
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-48 bg-gray-100">
        <img
          src={imageSrc}
          alt={property.title || "Property"}
          className="h-full w-full object-cover"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
        />

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${getStatusClasses(
            property.status,
          )}`}
        >
          {property.status || "active"}
        </span>
      </div>

      <div className="p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-indigo-600">
          {property.propertyType || "Property"}
        </p>

        <h3 className="mt-2 line-clamp-2 text-lg font-extrabold text-gray-900">
          {property.title || "Untitled Property"}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
          {property.location || "Location unavailable"}
          {property.city ? `, ${property.city}` : ""}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <strong className="text-lg text-gray-900">
            {formatCurrency(property.price)}
          </strong>

          <Link
            to={`/property/${property._id}`}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            View
          </Link>
        </div>

        {property.status === "active" && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onDeactivate(property._id)}
            className="mt-4 w-full rounded-lg bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading ? "Deactivating..." : "Deactivate Property"}
          </button>
        )}
      </div>
    </article>
  );
};

export default AdminDashboard;
