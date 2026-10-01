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
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-amber-100 text-amber-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-gray-100 text-gray-600";

      case "completed":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-600";
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
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />

          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mt-10 h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
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
              URBANNEST
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Buyer Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Manage your saved properties and booking activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/properties")}
            className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            Browse Properties
          </button>
        </header>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="♡"
            label="Saved Properties"
            value={favorites.length}
          />

          <StatCard icon="▣" label="Total Bookings" value={totalBookings} />

          <StatCard icon="◷" label="Pending" value={pendingBookings} />

          <StatCard icon="✓" label="Approved" value={approvedBookings} />
        </section>

        {/* Favorites */}
        <section className="mt-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                My Favorites
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Properties you've saved for later.
              </p>
            </div>

            {favorites.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="self-start text-sm font-bold text-indigo-600 hover:text-indigo-700 sm:self-auto"
              >
                Explore More →
              </button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {error}
            </div>
          )}

          {!error && favorites.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
              <div className="text-5xl text-indigo-200">♡</div>

              <h3 className="mt-4 text-xl font-extrabold text-gray-900">
                No favorites yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Browse properties and save the ones you like.
              </p>

              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
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
        <section className="mt-14 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold tracking-[0.16em] text-indigo-600">
                BOOKING ACTIVITY
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                My Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Track your booking requests and property reservations.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchBookings}
              disabled={bookingsLoading}
              className="self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-indigo-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              {bookingsLoading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {bookingError && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {bookingError}
            </div>
          )}

          {bookingsLoading ? (
            <div className="flex min-h-48 flex-col items-center justify-center text-sm text-gray-500">
              <div className="mb-3 h-7 w-7 animate-spin rounded-full border-3 border-gray-200 border-t-indigo-600" />
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                ▣
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-gray-900">
                No bookings yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                When you request a property booking, your booking activity will
                appear here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Find a Property
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
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
        </section>

        {completedBookings > 0 && (
          <section className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold">
              ✓
            </div>

            <div>
              <strong className="text-sm">
                {completedBookings} completed{" "}
                {completedBookings === 1 ? "booking" : "bookings"}
              </strong>

              <p className="mt-1 text-sm text-green-700">
                Your completed UrbanNest booking history is available above.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Cancellation modal */}
      {showCancelModal && selectedBooking && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={closeCancelModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-lg font-extrabold text-red-600">
              !
            </div>

            <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
              Cancel this booking?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              You're about to cancel your booking request for{" "}
              <strong className="text-gray-700">
                {selectedBooking.property?.title || "this property"}
              </strong>
              .
            </p>

            <label
              htmlFor="cancellationReason"
              className="mt-6 block text-sm font-bold text-gray-700"
            >
              Cancellation reason{" "}
              <span className="font-normal text-gray-400">Optional</span>
            </label>

            <textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              placeholder="Tell the seller why you're cancelling..."
              rows={4}
              disabled={Boolean(cancellingId)}
              className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
            />

            {bookingError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700"
              >
                {bookingError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCancelModal}
                disabled={Boolean(cancellingId)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={cancelBooking}
                disabled={Boolean(cancellingId)}
                className="rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
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

const FavoriteCard = ({ property, onRemove, onView }) => {
  const [imageSrc, setImageSrc] = useState(
    property.images?.[0] || FALLBACK_IMAGE,
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-56 bg-gray-100">
        <img
          src={imageSrc}
          alt={property.title || "Property"}
          className="h-full w-full object-cover"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
        />

        <button
          type="button"
          onClick={() => onRemove(property._id)}
          title="Remove from favorites"
          aria-label={`Remove ${property.title || "property"} from favorites`}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-red-500 shadow-md transition hover:bg-red-50"
        >
          ♥
        </button>

        <span className="absolute bottom-4 left-4 rounded-md bg-gray-900/80 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
          {property.propertyType || "Property"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-extrabold text-gray-900">
          {property.title || "Untitled Property"}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
          {property.location || "Location unavailable"}
          {property.city ? `, ${property.city}` : ""}
        </p>

        <div className="mt-4 flex gap-4 border-y border-gray-100 py-3 text-xs text-gray-500">
          <span>{property.bedrooms || 0} Beds</span>
          <span>{property.bathrooms || 0} Baths</span>
          <span>{property.area || 0} sq.ft.</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <strong className="text-lg text-gray-900">
            ₹{Number(property.price || 0).toLocaleString("en-IN")}
          </strong>

          <button
            type="button"
            onClick={onView}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
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
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
        <div className="relative h-52 bg-gray-100 lg:h-full lg:min-h-56">
          <img
            src={imageSrc}
            alt={property?.title || "Property"}
            className="h-full w-full object-cover"
            onError={() => setImageSrc(FALLBACK_IMAGE)}
          />

          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${getStatusStyle(
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

              <h3 className="mt-1 line-clamp-2 text-lg font-extrabold text-gray-900">
                {property?.title || "Property unavailable"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {property?.location || "—"}
                {property?.city ? `, ${property.city}` : ""}
              </p>
            </div>

            <strong className="shrink-0 text-lg text-gray-900">
              ₹{Number(booking.amount || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-y border-gray-100 py-4 sm:grid-cols-3">
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
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <strong className="text-xs text-gray-700">Seller's reason</strong>

              <p className="mt-1 text-sm leading-5 text-gray-600">
                {booking.rejectionReason}
              </p>
            </div>
          )}

          {booking.status === "cancelled" && booking.cancellationReason && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <strong className="text-xs text-gray-700">
                Cancellation reason
              </strong>

              <p className="mt-1 text-sm leading-5 text-gray-600">
                {booking.cancellationReason}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {property?._id && (
              <button
                type="button"
                onClick={onView}
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
              >
                View Property
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
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
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <strong className="text-sm text-gray-800">{value}</strong>
    </div>
  );
};

export default BuyerDashboard;
