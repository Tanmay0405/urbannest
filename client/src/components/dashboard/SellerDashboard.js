import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

const SellerDashboard = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [propertiesError, setPropertiesError] = useState("");
  const [bookingsError, setBookingsError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState("");
  const [deletingPropertyId, setDeletingPropertyId] = useState("");

  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  const token = localStorage.getItem("jwtoken");
  const userType = localStorage.getItem("userType");

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const handleUnauthorized = useCallback(
    (error) => {
      if (error.response?.status !== 401) {
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
    if (!token || userType !== "seller") {
      navigate("/login", { replace: true });
    }
  }, [token, userType, navigate]);

  const fetchMyProperties = useCallback(async () => {
    if (!token || userType !== "seller") {
      return;
    }

    try {
      setPropertiesLoading(true);
      setPropertiesError("");

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/seller/properties`,
        authConfig,
      );

      setProperties(response.data?.properties || []);
    } catch (error) {
      console.error("Failed to fetch seller properties:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setPropertiesError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load your properties. Please try again.",
      );
    } finally {
      setPropertiesLoading(false);
    }
  }, [authConfig, handleUnauthorized, token, userType]);

  const fetchSellerBookings = useCallback(async () => {
    if (!token || userType !== "seller") {
      return;
    }

    try {
      setBookingsLoading(true);
      setBookingsError("");

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/seller/bookings`,
        authConfig,
      );

      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error("Failed to fetch seller bookings:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setBookingsError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load booking requests. Please try again.",
      );
    } finally {
      setBookingsLoading(false);
    }
  }, [authConfig, handleUnauthorized, token, userType]);

  useEffect(() => {
    if (!token || userType !== "seller") {
      return;
    }

    fetchMyProperties();
    fetchSellerBookings();
  }, [fetchMyProperties, fetchSellerBookings, token, userType]);

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPropertyId(propertyId);
      setPropertiesError("");

      await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/properties/${propertyId}`,
        authConfig,
      );

      setProperties((currentProperties) =>
        currentProperties.filter((property) => property._id !== propertyId),
      );
    } catch (error) {
      console.error("Failed to delete property:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setPropertiesError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to delete the property. Please try again.",
      );
    } finally {
      setDeletingPropertyId("");
    }
  };

  const handleApprove = async (bookingId) => {
    setActionLoadingId(bookingId);
    setActionError("");

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_URL}/seller/bookings/${bookingId}/approve`,
        {},
        authConfig,
      );

      const updatedBooking = response.data?.booking;

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? updatedBooking || { ...booking, status: "approved" }
            : booking,
        ),
      );
    } catch (error) {
      console.error("Failed to approve booking:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setActionError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to approve this booking.",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const openRejectModal = (booking) => {
    setRejectingBooking(booking);
    setRejectionReason("");
    setActionError("");
  };

  const closeRejectModal = () => {
    if (actionLoadingId) {
      return;
    }

    setRejectingBooking(null);
    setRejectionReason("");
    setActionError("");
  };

  const handleReject = async () => {
    if (!rejectingBooking) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      setActionError("Please provide a rejection reason.");
      return;
    }

    const bookingId = rejectingBooking._id;

    setActionLoadingId(bookingId);
    setActionError("");

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_URL}/seller/bookings/${bookingId}/reject`,
        {
          rejectionReason: reason,
        },
        authConfig,
      );

      const updatedBooking = response.data?.booking;

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? updatedBooking || {
                ...booking,
                status: "rejected",
                rejectionReason: reason,
              }
            : booking,
        ),
      );

      setRejectingBooking(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject booking:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setActionError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to reject this booking.",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const activeProperties = properties.filter(
    (property) => property.status === "active",
  ).length;

  const inactiveProperties = properties.filter(
    (property) => property.status === "inactive",
  ).length;

  const soldProperties = properties.filter(
    (property) => property.status === "sold",
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  const approvedBookings = bookings.filter(
    (booking) => booking.status === "approved",
  ).length;

  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "rejected",
  ).length;

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

  const formatCurrency = (value) => {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "₹0";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getPropertyTitle = (booking) => {
    if (booking.property && typeof booking.property === "object") {
      return booking.property.title || "Property";
    }

    return "Property";
  };

  const getBuyerName = (booking) => {
    if (booking.buyer && typeof booking.buyer === "object") {
      return booking.buyer.name || booking.buyer.email || "Buyer";
    }

    return "Buyer";
  };

  const getBuyerEmail = (booking) => {
    if (booking.buyer && typeof booking.buyer === "object") {
      return booking.buyer.email || "";
    }

    return "";
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

      case "approved":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

      case "rejected":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";

      case "cancelled":
        return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

      case "completed":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

      default:
        return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
    }
  };

  if (!token || userType !== "seller") {
    return null;
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
                URBANNEST
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your seller dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Manage your property listings and respond to incoming buyer
                requests from one place.
              </p>
            </div>

            <Link
              to="/property/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100 sm:w-auto"
            >
              <span className="text-lg leading-none">+</span>
              List New Property
            </Link>
          </div>
        </header>

        {/* Global Action Error */}
        {actionError && !rejectingBooking && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            <span className="mt-0.5 font-extrabold">!</span>
            <span>{actionError}</span>
          </div>
        )}

        {/* Stats */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="⌂"
            label="Total Listings"
            value={properties.length}
            description="Properties in your portfolio"
          />

          <StatCard
            icon="✓"
            label="Active Listings"
            value={activeProperties}
            description="Currently visible to buyers"
          />

          <StatCard
            icon="◷"
            label="Pending Requests"
            value={pendingBookings}
            description="Awaiting your response"
          />

          <StatCard
            icon="▣"
            label="Approved Bookings"
            value={approvedBookings}
            description="Confirmed reservations"
          />
        </section>

        {/* Booking Requests */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                  Booking Management
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                  Incoming Booking Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review buyer requests and approve or reject pending bookings.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchSellerBookings}
                disabled={bookingsLoading}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookingsLoading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">
                {pendingBookings} pending
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">
                {approvedBookings} approved
              </span>

              <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-700 ring-1 ring-red-200">
                {rejectedBookings} rejected
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {bookingsError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                <span className="mt-0.5 font-extrabold">!</span>
                <span>{bookingsError}</span>
              </div>
            )}

            {bookingsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="space-y-5 p-5 sm:p-6">
                      <div className="flex justify-between gap-4">
                        <div className="space-y-2">
                          <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                          <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
                        </div>

                        <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-5 lg:grid-cols-5">
                        {[1, 2, 3, 4, 5].map((cell) => (
                          <div key={cell} className="space-y-2">
                            <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                          </div>
                        ))}
                      </div>

                      <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600">
                  ◷
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                  No booking requests yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  New buyer booking requests will appear here when someone
                  requests one of your properties.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isPending = booking.status === "pending";
                  const isProcessing = actionLoadingId === booking._id;

                  return (
                    <article
                      key={booking._id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-100 hover:shadow-md"
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                              Property
                            </p>

                            <h3 className="mt-1 break-words text-lg font-extrabold text-slate-900">
                              {getPropertyTitle(booking)}
                            </h3>
                          </div>

                          <span
                            className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${getStatusClasses(
                              booking.status,
                            )}`}
                          >
                            {booking.status || "unknown"}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
                          <BookingInfo
                            label="Buyer"
                            value={getBuyerName(booking)}
                            secondary={getBuyerEmail(booking)}
                          />

                          <BookingInfo
                            label="Booking Date"
                            value={formatDate(booking.bookingDate)}
                          />

                          <BookingInfo
                            label="Start Date"
                            value={formatDate(booking.startDate)}
                          />

                          <BookingInfo
                            label="End Date"
                            value={formatDate(booking.endDate)}
                          />

                          <BookingInfo
                            label="Amount"
                            value={formatCurrency(booking.amount)}
                            strong
                          />
                        </div>

                        {booking.rejectionReason && (
                          <ReasonBox
                            label="Rejection reason"
                            value={booking.rejectionReason}
                          />
                        )}

                        {booking.cancellationReason && (
                          <ReasonBox
                            label="Cancellation reason"
                            value={booking.cancellationReason}
                          />
                        )}

                        {isPending && (
                          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={() => handleApprove(booking._id)}
                              disabled={isProcessing}
                              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isProcessing ? "Processing..." : "Approve"}
                            </button>

                            <button
                              type="button"
                              onClick={() => openRejectModal(booking)}
                              disabled={isProcessing}
                              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Property Management */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                Property Management
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                My Properties
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the properties you have listed on UrbanNest.
              </p>
            </div>

            <Link
              to="/property/new"
              className="inline-flex w-fit items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              + Add Property
            </Link>
          </div>

          <div className="mb-5 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">
              {activeProperties} active
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 ring-1 ring-slate-200">
              {inactiveProperties} inactive
            </span>

            {soldProperties > 0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 ring-1 ring-blue-200">
                {soldProperties} sold
              </span>
            )}
          </div>

          {propertiesError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              <span className="mt-0.5 font-extrabold">!</span>
              <span>{propertiesError}</span>
            </div>
          )}

          {propertiesLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-56 animate-pulse bg-slate-200" />

                  <div className="space-y-4 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl font-bold text-indigo-600">
                +
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                No properties listed yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Start building your UrbanNest portfolio by listing your first
                property.
              </p>

              <Link
                to="/property/new"
                className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                List Your First Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <SellerPropertyCard
                  key={property._id}
                  property={property}
                  deletingPropertyId={deletingPropertyId}
                  onDelete={handleDelete}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Reject Modal */}
      {rejectingBooking && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeRejectModal}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                    Booking Request
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                    Reject Booking
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={Boolean(actionLoadingId)}
                  aria-label="Close rejection dialog"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xl text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Property
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {getPropertyTitle(rejectingBooking)}
                </p>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-500">
                Please provide a reason for rejecting this booking request. The
                reason will be visible to the buyer.
              </p>

              <label
                htmlFor="rejectionReason"
                className="mt-6 block text-sm font-bold text-slate-700"
              >
                Reason for rejection
              </label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Explain why this booking cannot be accepted..."
                rows={5}
                disabled={Boolean(actionLoadingId)}
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100"
              />

              {actionError && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {actionError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={Boolean(actionLoadingId)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={Boolean(actionLoadingId)}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoadingId ? "Rejecting..." : "Reject Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

const BookingInfo = ({ label, value, secondary, strong = false }) => {
  return (
    <div className="min-w-0">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <strong
        className={`mt-1 block break-words text-sm ${
          strong ? "text-slate-900" : "text-slate-800"
        }`}
      >
        {value}
      </strong>

      {secondary && (
        <span className="mt-1 block break-words text-xs text-slate-500">
          {secondary}
        </span>
      )}
    </div>
  );
};

const ReasonBox = ({ label, value }) => {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <strong className="text-xs font-bold text-slate-700">{label}</strong>

      <p className="mt-1 break-words text-sm leading-5 text-slate-600">
        {value}
      </p>
    </div>
  );
};

const SellerPropertyCard = ({
  property,
  deletingPropertyId,
  onDelete,
  formatCurrency,
}) => {
  const [imageSrc, setImageSrc] = useState(
    property.images?.[0] || FALLBACK_IMAGE,
  );

  const isDeleting = deletingPropertyId === property._id;

  const statusClasses =
    property.status === "active"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : property.status === "sold"
        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

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
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${statusClasses}`}
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

        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Listed Price
          </p>

          <strong className="mt-0.5 block text-xl font-extrabold text-slate-900">
            {formatCurrency(property.price)}
          </strong>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            to={`/property/${property._id}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            View
          </Link>

          <Link
            to={`/property/edit/${property._id}`}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={() => onDelete(property._id)}
            disabled={isDeleting}
            className="col-span-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Property"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default SellerDashboard;
