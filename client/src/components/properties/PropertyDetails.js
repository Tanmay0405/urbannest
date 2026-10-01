import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=85";

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

    // Favorite state depends on the loaded property and active role.
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

  const handleBack = () => {
    navigate("/properties");
  };

  const handlePreviousImage = () => {
    setImageError(false);

    setSelectedImage((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const handleNextImage = () => {
    setImageError(false);

    setSelectedImage((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-6 h-5 w-36 rounded bg-slate-200" />

          <div className="overflow-hidden rounded-3xl bg-white">
            <div className="h-[320px] bg-slate-200 sm:h-[480px] lg:h-[560px]" />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-3xl bg-white p-8">
              <div className="h-5 w-28 rounded bg-slate-200" />
              <div className="mt-5 h-10 w-3/4 rounded bg-slate-200" />
              <div className="mt-3 h-5 w-1/2 rounded bg-slate-200" />

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="h-24 rounded-xl bg-slate-200" />
                <div className="h-24 rounded-xl bg-slate-200" />
                <div className="h-24 rounded-xl bg-slate-200" />
              </div>

              <div className="mt-10 h-5 w-40 rounded bg-slate-200" />
              <div className="mt-4 h-24 rounded bg-slate-200" />
            </div>

            <div className="h-96 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
            Property not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error || "The property you're looking for is no longer available."}
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="mt-7 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
          <span className="text-lg">←</span>
          Back to Properties
        </button>

        {/* Gallery */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50">
          <div className="relative h-[320px] bg-slate-100 sm:h-[480px] lg:h-[560px]">
            <img
              src={imageError ? FALLBACK_IMAGE : currentImage}
              alt={property.title || "Property"}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

            {/* Status */}
            <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                  isActive
                    ? "bg-emerald-500/95 text-white"
                    : "bg-slate-800/90 text-white"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-white" : "bg-slate-400"
                  }`}
                />

                {property.status}
              </span>
            </div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-5 right-5 rounded-full bg-black/65 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Gallery controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-800 shadow-lg transition hover:bg-white"
                  aria-label="Previous image"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-800 shadow-lg transition hover:bg-white"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {/* Gallery title */}
            <div className="absolute bottom-5 left-5 max-w-2xl sm:left-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                UrbanNest Property
              </p>

              <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
                {property.title}
              </h1>

              <p className="mt-2 text-sm font-medium text-white/90">
                {property.city}
                {property.location ? ` • ${property.location}` : ""}
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto border-t border-slate-100 p-4">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(index);
                    setImageError(false);
                  }}
                  className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === index
                      ? "border-indigo-600 shadow-md"
                      : "border-transparent hover:border-slate-300"
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
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Details */}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                {property.propertyType}
              </span>

              <span className="text-xs font-semibold text-slate-400">
                Listed on UrbanNest
              </span>
            </div>

            <div className="mt-5">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {property.title}
              </h2>

              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500 sm:text-base">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5 shrink-0 text-indigo-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21s7-6.25 7-11a7 7 0 1 0-14 0c0 4.75 7 11 7 11Z"
                  />

                  <circle cx="12" cy="10" r="2.5" />
                </svg>

                <span>
                  <strong className="text-slate-700">{property.city}</strong>

                  {property.location ? ` • ${property.location}` : ""}
                </span>
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="border-r border-slate-200 px-3 py-5 text-center sm:px-5">
                <p className="text-xl font-extrabold text-slate-900">
                  {property.bedrooms || 0}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Bedrooms
                </p>
              </div>

              <div className="border-r border-slate-200 px-3 py-5 text-center sm:px-5">
                <p className="text-xl font-extrabold text-slate-900">
                  {property.bathrooms || 0}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Bathrooms
                </p>
              </div>

              <div className="px-3 py-5 text-center sm:px-5">
                <p className="text-xl font-extrabold text-slate-900">
                  {Number(property.area || 0).toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Sq. Ft.
                </p>
              </div>
            </div>

            {/* Description */}
            <section className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.25h13.5v13.5H5.25z"
                    />
                    <path
                      strokeLinecap="round"
                      d="M8.25 9h7.5M8.25 12h7.5M8.25 15h5"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  About this property
                </h3>
              </div>

              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                {property.description}
              </p>
            </section>

            {/* Amenities */}
            <section className="mt-10 border-t border-slate-100 pt-8">
              <h3 className="text-xl font-bold text-slate-900">Amenities</h3>

              {property.amenities?.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                        ✓
                      </span>

                      <span className="text-sm font-semibold text-slate-700">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No amenities have been listed for this property.
                </p>
              )}
            </section>

            {/* Location */}
            <section className="mt-10 border-t border-slate-100 pt-8">
              <h3 className="text-xl font-bold text-slate-900">Location</h3>

              <div className="mt-5 flex gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21s7-6.25 7-11a7 7 0 1 0-14 0c0 4.75 7 11 7 11Z"
                    />

                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div>

                <div>
                  <p className="font-bold text-slate-900">{property.city}</p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {property.location}
                  </p>
                </div>
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-300/50">
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                  Property Price
                </p>

                <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  ₹{Number(property.price || 0).toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Listed on UrbanNest
                </p>

                <div className="my-6 h-px bg-white/10" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-400">
                      Property type
                    </span>

                    <strong className="text-right text-sm text-white">
                      {property.propertyType}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-400">City</span>

                    <strong className="text-right text-sm text-white">
                      {property.city}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-400">Status</span>

                    <strong
                      className={`text-right text-sm capitalize ${
                        isActive ? "text-emerald-400" : "text-slate-300"
                      }`}
                    >
                      {property.status}
                    </strong>
                  </div>
                </div>

                {/* Favorite */}
                {isBuyer && (
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${
                      isFavorite
                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        : "border-white/15 bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    <span className="text-lg">{isFavorite ? "♥" : "♡"}</span>

                    {favoriteLoading
                      ? "Updating..."
                      : isFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites"}
                  </button>
                )}

                {/* Booking */}
                {isActive && isBuyer ? (
                  <button
                    type="button"
                    onClick={openBookingForm}
                    className="mt-3 w-full rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/30"
                  >
                    Request Booking
                  </button>
                ) : !token ? (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-7 w-full rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/30"
                  >
                    Login to Book
                  </button>
                ) : userType === "seller" ? (
                  <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-bold text-white">
                      Seller account
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Manage your properties and booking requests from your
                      seller dashboard.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-7 w-full cursor-not-allowed rounded-xl bg-white/10 px-5 py-3.5 text-sm font-bold text-slate-500"
                  >
                    Booking Unavailable
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Explore More Properties
                </button>
              </div>

              <div className="border-t border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      UrbanNest marketplace
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Explore properties and submit booking requests through a
                      simple marketplace experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={closeBookingForm}
        >
          <div
            className="my-6 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-6 text-white sm:px-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                    UrbanNest Booking
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold">
                    Request a booking
                  </h2>

                  <p className="mt-1 text-sm text-indigo-100">
                    {property.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBookingForm}
                  disabled={bookingLoading}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close booking form"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Property
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {property.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {property.location}, {property.city}
                  </p>
                </div>

                <p className="flex-shrink-0 text-xl font-extrabold text-slate-900">
                  ₹{Number(property.price || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="mt-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="bookingDate"
                      className="mb-2 block text-sm font-semibold text-slate-700"
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
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="startDate"
                      className="mb-2 block text-sm font-semibold text-slate-700"
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
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="mb-2 block text-sm font-semibold text-slate-700"
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
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bookingAmount"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Listed amount
                    </label>

                    <div
                      id="bookingAmount"
                      className="flex min-h-[48px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900"
                    >
                      ₹{Number(property.price || 0).toLocaleString("en-IN")}
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Taken from the property's listed price.
                    </p>
                  </div>
                </div>

                {bookingError && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700"
                  >
                    {bookingError}
                  </div>
                )}

                {bookingSuccess && (
                  <div
                    role="status"
                    className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-5 text-emerald-700"
                  >
                    {bookingSuccess}
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeBookingForm}
                    disabled={bookingLoading}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingLoading
                      ? "Sending Request..."
                      : "Send Booking Request"}
                  </button>
                </div>
              </form>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                Your request remains pending until the seller reviews and
                approves it.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PropertyDetails;
