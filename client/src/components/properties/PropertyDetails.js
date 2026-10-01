import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2";

const PropertyDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(false);

  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [property, setProperty] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);

  const [imageError, setImageError] = useState(false);

  const [showBookingForm, setShowBookingForm] = useState(false);

  const [bookingDate, setBookingDate] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingError, setBookingError] = useState("");

  const [bookingSuccess, setBookingSuccess] = useState("");

  const token = localStorage.getItem("jwtoken");

  const userType = localStorage.getItem("userType");

  const checkFavorite = async (propertyId) => {
    if (!token || userType !== "buyer" || !propertyId) {
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const exists = (response.data?.favorites || []).some((item) => {
        const favoriteId = typeof item === "string" ? item : item?._id;

        return String(favoriteId) === String(propertyId);
      });

      setIsFavorite(exists);
    } catch (error) {
      console.error(
        "CHECK FAVORITE ERROR:",
        error.response?.data || error.message,
      );
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (userType !== "buyer" || !property?._id) {
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await axios.delete(
          `${process.env.REACT_APP_SERVER_URL}/favorites/${property._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setIsFavorite(false);
      } else {
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/favorites/${property._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setIsFavorite(true);
      }
    } catch (error) {
      console.error(
        "TOGGLE FAVORITE ERROR:",
        error.response?.data || error.message,
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/properties/${id}`,
        );

        setProperty(response.data?.property || null);

        setSelectedImage(0);

        setImageError(false);
      } catch (err) {
        console.error("FETCH PROPERTY ERROR:", err);

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Unable to load property details.",
        );

        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (property?._id && userType === "buyer") {
      checkFavorite(property._id);
    }

    // The favorite check intentionally runs when the loaded property or buyer role changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property, userType]);

  const images =
    property?.images?.length > 0 ? property.images : [FALLBACK_IMAGE];

  const currentImage = images[selectedImage] || FALLBACK_IMAGE;

  const today = new Date().toISOString().split("T")[0];

  const openBookingForm = () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (userType !== "buyer" || property?.status !== "active") {
      return;
    }

    setBookingError("");

    setBookingSuccess("");

    setShowBookingForm(true);
  };

  const closeBookingForm = () => {
    if (bookingLoading) {
      return;
    }

    setShowBookingForm(false);

    setBookingError("");

    setBookingSuccess("");
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    setBookingError("");

    setBookingSuccess("");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userType !== "buyer") {
      setBookingError("Only buyers can request a booking.");
      return;
    }

    if (property?.status !== "active") {
      setBookingError("This property is currently unavailable for booking.");
      return;
    }

    if (!bookingDate || !startDate || !endDate) {
      setBookingError("Please select all required dates.");
      return;
    }

    const requestDate = new Date(bookingDate);

    const start = new Date(startDate);

    const end = new Date(endDate);

    if (
      Number.isNaN(requestDate.getTime()) ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setBookingError("Please enter valid booking dates.");
      return;
    }

    if (start >= end) {
      setBookingError("End date must be after the start date.");
      return;
    }

    try {
      setBookingLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/bookings`,
        {
          propertyId: property._id,
          bookingDate,
          startDate,
          endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setBookingSuccess(
        response.data?.message || "Booking request created successfully.",
      );

      setBookingDate("");

      setStartDate("");

      setEndDate("");

      setTimeout(() => {
        setShowBookingForm(false);

        setBookingSuccess("");
      }, 1800);
    } catch (err) {
      console.error("CREATE BOOKING ERROR:", err);

      setBookingError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to create the booking request. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleBack = () => {
    navigate("/properties");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-gray-200" />

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-[320px] animate-pulse bg-gray-200 sm:h-[460px]" />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />

              <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-gray-200" />

              <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="h-20 animate-pulse rounded-lg bg-gray-200" />

                <div className="h-20 animate-pulse rounded-lg bg-gray-200" />

                <div className="h-20 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>

            <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Property not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error || "The property you're looking for is no longer available."}
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Browse Properties
          </button>
        </section>
      </main>
    );
  }

  const isActive = property.status === "active";

  const isBuyer = userType === "buyer";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          <span className="text-lg">←</span>
          Back to Properties
        </button>

        {/* Gallery */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="relative h-[300px] bg-gray-100 sm:h-[440px] lg:h-[520px]">
            <img
              src={imageError ? FALLBACK_IMAGE : currentImage}
              alt={property.title || "Property"}
              className="h-full w-full object-cover"
              onError={handleImageError}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />

            <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ${
                  isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-green-600" : "bg-gray-500"
                  }`}
                />

                {property.status}
              </span>
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto p-3 sm:p-4">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(index);
                    setImageError(false);
                  }}
                  className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-28 ${
                    selectedImage === index
                      ? "border-indigo-600"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  aria-label={`View property image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${property.title || "Property"} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Main content */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-700">
                {property.propertyType}
              </span>

              <span className="text-xs font-semibold text-gray-400">
                UrbanNest Listing
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {property.title}
            </h1>

            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              <span className="font-semibold text-gray-700">
                {property.city}
              </span>

              {property.location ? ` • ${property.location}` : ""}
            </p>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <div className="border-r border-gray-200 px-3 py-4 text-center sm:px-5">
                <p className="text-lg font-bold text-gray-900">
                  {property.bedrooms || 0}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Bedrooms
                </p>
              </div>

              <div className="border-r border-gray-200 px-3 py-4 text-center sm:px-5">
                <p className="text-lg font-bold text-gray-900">
                  {property.bathrooms || 0}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Bathrooms
                </p>
              </div>

              <div className="px-3 py-4 text-center sm:px-5">
                <p className="text-lg font-bold text-gray-900">
                  {Number(property.area || 0).toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Sq. Ft.
                </p>
              </div>
            </div>

            {/* Description */}
            <section className="mt-9 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-bold text-gray-900">
                About this property
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {property.description}
              </p>
            </section>

            {/* Amenities */}
            <section className="mt-9 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-bold text-gray-900">Amenities</h2>

              {property.amenities?.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium text-gray-700"
                    >
                      <span className="font-bold text-green-600">✓</span>

                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  No amenities have been listed for this property.
                </p>
              )}
            </section>

            {/* Location */}
            <section className="mt-9 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-bold text-gray-900">Location</h2>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="font-bold text-gray-900">{property.city}</p>

                <p className="mt-1 text-sm text-gray-600">
                  {property.location}
                </p>
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl bg-gray-900 p-6 text-white shadow-xl sm:p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Property Price
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight">
                ₹{Number(property.price || 0).toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-xs text-gray-400">Listed on UrbanNest</p>

              <div className="my-6 h-px bg-white/10" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-400">Property type</span>

                  <strong className="text-right text-sm">
                    {property.propertyType}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-400">City</span>

                  <strong className="text-right text-sm">
                    {property.city}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-400">Status</span>

                  <strong
                    className={`text-right text-sm capitalize ${
                      isActive ? "text-green-400" : "text-gray-300"
                    }`}
                  >
                    {property.status}
                  </strong>
                </div>
              </div>

              {isBuyer && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className={`mt-7 w-full rounded-lg border px-5 py-3.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    isFavorite
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {favoriteLoading
                    ? "Updating Favorite..."
                    : isFavorite
                      ? "♥ Remove from Favorites"
                      : "♡ Add to Favorites"}
                </button>
              )}

              {isActive && isBuyer ? (
                <button
                  type="button"
                  onClick={openBookingForm}
                  className="mt-7 w-full rounded-lg bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  Request Booking
                </button>
              ) : !token ? (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-7 w-full rounded-lg bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Login to Book
                </button>
              ) : userType === "seller" ? (
                <div className="mt-7 rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-bold text-white">Seller account</p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Manage your properties and booking requests from your seller
                    dashboard.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-7 w-full cursor-not-allowed rounded-lg bg-white/20 px-5 py-3.5 text-sm font-bold text-gray-400"
                >
                  Booking Unavailable
                </button>
              )}

              <button
                type="button"
                onClick={handleBack}
                className="mt-3 w-full rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Explore More Properties
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-gray-900">UrbanNest</p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Explore properties with a simple, transparent booking
                experience.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeBookingForm}
        >
          <div
            className="my-6 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  UrbanNest Booking
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  Request a booking
                </h2>

                <p className="mt-1 text-sm text-gray-500">{property.title}</p>
              </div>

              <button
                type="button"
                onClick={closeBookingForm}
                disabled={bookingLoading}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close booking form"
              >
                ×
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Property
                </p>

                <p className="mt-1 truncate text-sm font-bold text-gray-900">
                  {property.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {property.location}, {property.city}
                </p>
              </div>

              <p className="flex-shrink-0 text-lg font-extrabold text-gray-900">
                ₹{Number(property.price || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="mt-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="bookingDate"
                    className="mb-1.5 block text-xs font-bold text-gray-700"
                  >
                    Booking request date
                  </label>

                  <input
                    id="bookingDate"
                    type="date"
                    value={bookingDate}
                    onChange={(event) => setBookingDate(event.target.value)}
                    min={today}
                    disabled={bookingLoading}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-1.5 block text-xs font-bold text-gray-700"
                  >
                    Start date
                  </label>

                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    min={bookingDate || today}
                    disabled={bookingLoading}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-1.5 block text-xs font-bold text-gray-700"
                  >
                    End date
                  </label>

                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    min={startDate || bookingDate || today}
                    disabled={bookingLoading}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bookingAmount"
                    className="mb-1.5 block text-xs font-bold text-gray-700"
                  >
                    Listed amount
                  </label>

                  <div
                    id="bookingAmount"
                    className="flex min-h-[46px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-bold text-gray-900"
                  >
                    ₹{Number(property.price || 0).toLocaleString("en-IN")}
                  </div>

                  <p className="mt-1.5 text-xs text-gray-400">
                    Taken from the property's listed price.
                  </p>
                </div>
              </div>

              {bookingError && (
                <div
                  role="alert"
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {bookingError}
                </div>
              )}

              {bookingSuccess && (
                <div
                  role="status"
                  className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
                >
                  {bookingSuccess}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeBookingForm}
                  disabled={bookingLoading}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingLoading
                    ? "Sending Request..."
                    : "Send Booking Request"}
                </button>
              </div>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-gray-400">
              Your request remains pending until the seller reviews and approves
              it.
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default PropertyDetails;
