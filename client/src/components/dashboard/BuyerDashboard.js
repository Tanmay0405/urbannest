import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

const BuyerDashboard = () => {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  const [cancellingId, setCancellingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

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
      const status = error.response?.status;

      if (status === 401) {
        localStorage.removeItem("jwtoken");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("userType");
        localStorage.removeItem("userEmail");

        navigate("/login");
        return true;
      }

      return false;
    },
    [navigate],
  );

  useEffect(() => {
    if (!token || userType !== "buyer") {
      navigate("/login");
    }
  }, [token, userType, navigate]);

  const fetchFavorites = useCallback(async () => {
    if (!token || userType !== "buyer") {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/favorites`,
        authConfig,
      );

      setFavorites(response.data?.favorites || []);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load your favorites.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authConfig, handleUnauthorized, token, userType]);

  const fetchBookings = useCallback(async () => {
    if (!token || userType !== "buyer") {
      return;
    }

    try {
      setBookingsLoading(true);
      setBookingError("");

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/bookings/my`,
        authConfig,
      );

      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setBookingError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load your bookings.",
      );
    } finally {
      setBookingsLoading(false);
    }
  }, [authConfig, handleUnauthorized, token, userType]);

  useEffect(() => {
    if (!token || userType !== "buyer") {
      return;
    }

    fetchFavorites();
    fetchBookings();
  }, [fetchFavorites, fetchBookings, token, userType]);

  const removeFavorite = async (propertyId) => {
    try {
      setError("");

      await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/favorites/${propertyId}`,
        authConfig,
      );

      setFavorites((previousFavorites) =>
        previousFavorites.filter((property) => property._id !== propertyId),
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to remove this favorite.",
      );
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancellationReason("");
    setBookingError("");
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    if (cancellingId) {
      return;
    }

    setSelectedBooking(null);
    setCancellationReason("");
    setBookingError("");
    setShowCancelModal(false);
  };

  const cancelBooking = async () => {
    if (!selectedBooking) {
      return;
    }

    try {
      setCancellingId(selectedBooking._id);
      setBookingError("");

      const reason = cancellationReason.trim() || "Cancelled by buyer";

      await axios.patch(
        `${process.env.REACT_APP_SERVER_URL}/bookings/${selectedBooking._id}/cancel`,
        {
          cancellationReason: reason,
        },
        authConfig,
      );

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === selectedBooking._id
            ? {
                ...booking,
                status: "cancelled",
                cancellationReason: reason,
              }
            : booking,
        ),
      );

      setSelectedBooking(null);
      setCancellationReason("");
      setShowCancelModal(false);
    } catch (error) {
      console.error("Failed to cancel booking:", error);

      if (handleUnauthorized(error)) {
        return;
      }

      setBookingError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to cancel this booking.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

      case "pending":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

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

  const getStatusLabel = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const canCancelBooking = (status) => {
    return status === "pending" || status === "approved";
  };

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  const approvedBookings = bookings.filter(
    (booking) => booking.status === "approved",
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-10 h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 shadow-xl sm:px-8 sm:py-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold tracking-[0.25em] text-indigo-300">
                URBANNEST
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your property dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Keep track of your saved properties and booking activity from
                one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100 sm:w-auto"
            >
              Browse Properties
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="♡"
            label="Saved Properties"
            value={favorites.length}
            description="Your favorites"
          />

          <StatCard
            icon="▣"
            label="Total Bookings"
            value={totalBookings}
            description="All booking activity"
          />

          <StatCard
            icon="◷"
            label="Pending"
            value={pendingBookings}
            description="Awaiting seller response"
          />

          <StatCard
            icon="✓"
            label="Approved"
            value={approvedBookings}
            description="Confirmed bookings"
          />
        </section>

        {/* Favorites */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                Saved for later
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                My Favorites
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Properties you've saved for later.
              </p>
            </div>

            {favorites.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="self-start rounded-lg px-2 py-2 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 sm:self-auto"
              >
                Explore More →
              </button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              <span className="mt-0.5 font-extrabold">!</span>
              <span>{error}</span>
            </div>
          )}

          {!error && favorites.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl text-indigo-400">
                ♡
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                No favorites yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Browse UrbanNest properties and save the ones you'd like to
                revisit.
              </p>

              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                Explore Properties
              </button>
            </div>
          )}

          {!error && favorites.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {favorites.map((property) => (
                <FavoriteCard
                  key={property._id}
                  property={property}
                  onRemove={removeFavorite}
                  onView={() => navigate(`/property/${property._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Bookings */}
        <section className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                  Booking Activity
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                  My Bookings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track your booking requests and property reservations.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchBookings}
                disabled={bookingsLoading}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookingsLoading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {bookingError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                <span className="mt-0.5 font-extrabold">!</span>
                <span>{bookingError}</span>
              </div>
            )}

            {bookingsLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
                      <div className="h-52 animate-pulse bg-slate-200 lg:h-full" />

                      <div className="space-y-4 p-5">
                        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                        <div className="h-16 animate-pulse rounded bg-slate-100" />
                        <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
                  ▣
                </div>

                <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                  No bookings yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  When you request a property booking, your booking activity
                  will appear here.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/properties")}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  Find a Property
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onView={() =>
                      booking.property?._id &&
                      navigate(`/property/${booking.property._id}`)
                    }
                    onCancel={() => openCancelModal(booking)}
                    formatDate={formatDate}
                    canCancel={canCancelBooking(booking.status)}
                    getStatusStyle={getStatusStyle}
                    getStatusLabel={getStatusLabel}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Completed Summary */}
        {completedBookings > 0 && (
          <section className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
              ✓
            </div>

            <div>
              <strong className="text-sm">
                {completedBookings} completed{" "}
                {completedBookings === 1 ? "booking" : "bookings"}
              </strong>

              <p className="mt-1 text-sm text-emerald-700">
                Your completed UrbanNest booking history is available above.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && selectedBooking && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeCancelModal}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 sm:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-lg font-extrabold text-red-600">
                  !
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Cancel this booking?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    This action will cancel your current booking request.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Property
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {selectedBooking.property?.title || "This property"}
                </p>
              </div>

              <label
                htmlFor="cancellationReason"
                className="mt-6 block text-sm font-bold text-slate-700"
              >
                Cancellation reason{" "}
                <span className="font-normal text-slate-400">Optional</span>
              </label>

              <textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                placeholder="Tell the seller why you're cancelling..."
                rows={4}
                disabled={Boolean(cancellingId)}
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100"
              />

              {bookingError && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {bookingError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCancelModal}
                  disabled={Boolean(cancellingId)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep Booking
                </button>

                <button
                  type="button"
                  onClick={cancelBooking}
                  disabled={Boolean(cancellingId)}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancellingId ? "Cancelling..." : "Yes, Cancel Booking"}
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

const FavoriteCard = ({ property, onRemove, onView }) => {
  const [imageSrc, setImageSrc] = useState(
    property.images?.[0] || FALLBACK_IMAGE,
  );

  const locationText = property.city
    ? `${property.location || "Location unavailable"}, ${property.city}`
    : property.location || "Location unavailable";

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

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

        <button
          type="button"
          onClick={() => onRemove(property._id)}
          title="Remove from favorites"
          aria-label={`Remove ${property.title || "property"} from favorites`}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-red-500 shadow-md transition hover:bg-red-50"
        >
          ♥
        </button>

        <span className="absolute bottom-3 left-4 rounded-full bg-slate-900/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur-sm">
          {property.propertyType || "Property"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-extrabold text-slate-900">
          {property.title || "Untitled Property"}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {locationText}
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

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Listed Price
            </p>

            <strong className="mt-0.5 block text-lg font-extrabold text-slate-900">
              ₹{Number(property.price || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          <button
            type="button"
            onClick={onView}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            View Property
          </button>
        </div>
      </div>
    </article>
  );
};

const BookingCard = ({
  booking,
  onView,
  onCancel,
  formatDate,
  canCancel,
  getStatusStyle,
  getStatusLabel,
}) => {
  const property = booking.property;

  const [imageSrc, setImageSrc] = useState(
    property?.images?.[0] || FALLBACK_IMAGE,
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-100 hover:shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
        <div className="relative h-56 overflow-hidden bg-slate-100 lg:h-full lg:min-h-56">
          <img
            src={imageSrc}
            alt={property?.title || "Property"}
            className="h-full w-full object-cover"
            onError={() => {
              if (imageSrc !== FALLBACK_IMAGE) {
                setImageSrc(FALLBACK_IMAGE);
              }
            }}
          />

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${getStatusStyle(
              booking.status,
            )}`}
          >
            {getStatusLabel(booking.status)}
          </span>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                {property?.propertyType || "Property"}
              </p>

              <h3 className="mt-1 line-clamp-2 text-lg font-extrabold text-slate-900">
                {property?.title || "Property unavailable"}
              </h3>

              <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                {property?.location || "—"}
                {property?.city ? `, ${property.city}` : ""}
              </p>
            </div>

            <div className="shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Booking Amount
              </p>

              <strong className="mt-0.5 block text-lg font-extrabold text-slate-900">
                ₹{Number(booking.amount || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
            <BookingDate
              label="Requested"
              value={formatDate(booking.bookingDate)}
            />

            <BookingDate
              label="Start Date"
              value={formatDate(booking.startDate)}
            />

            <BookingDate label="End Date" value={formatDate(booking.endDate)} />
          </div>

          {booking.status === "rejected" && booking.rejectionReason && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <strong className="text-xs font-bold text-red-700">
                Seller's reason
              </strong>

              <p className="mt-1 text-sm leading-5 text-red-600">
                {booking.rejectionReason}
              </p>
            </div>
          )}

          {booking.status === "cancelled" && booking.cancellationReason && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <strong className="text-xs font-bold text-slate-700">
                Cancellation reason
              </strong>

              <p className="mt-1 text-sm leading-5 text-slate-600">
                {booking.cancellationReason}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {property?._id && (
              <button
                type="button"
                onClick={onView}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                View Property
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const BookingDate = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <strong className="text-sm text-slate-800">{value}</strong>
    </div>
  );
};

export default BuyerDashboard;
