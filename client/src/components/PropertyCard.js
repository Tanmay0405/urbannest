import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2";

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

  const [imageSrc, setImageSrc] = useState(
    property.images?.[0] || FALLBACK_IMAGE,
  );

  const handleViewDetails = () => {
    navigate(`/property/${property._id}`);
  };

  const formattedPrice = Number(property.price || 0).toLocaleString("en-IN");

  const locationText = property.city
    ? `${property.city}${property.location ? ` • ${property.location}` : ""}`
    : property.location || "Location unavailable";

  const hasAmenities =
    Array.isArray(property.amenities) && property.amenities.length > 0;

  return (
    <article
      className="group w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl"
      onClick={handleViewDetails}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={property.title || "UrbanNest property"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={() => {
            if (imageSrc !== FALLBACK_IMAGE) {
              setImageSrc(FALLBACK_IMAGE);
            }
          }}
        />

        {/* Image Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Property Type */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm">
            {property.propertyType || "Property"}
          </span>
        </div>

        {/* Status */}
        {property.status && property.status !== "active" && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-bold capitalize text-white shadow-sm backdrop-blur-sm">
              {property.status}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 left-4">
          <p className="text-xl font-extrabold tracking-tight text-white">
            ₹ {formattedPrice}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h2 className="line-clamp-1 text-lg font-extrabold text-slate-900">
          {property.title || "Untitled Property"}
        </h2>

        {/* Location */}
        <p
          className="mt-1.5 line-clamp-1 text-sm text-slate-500"
          title={locationText}
        >
          {locationText}
        </p>

        {/* Property Stats */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-100 bg-slate-50 py-3">
          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-800">
              {property.bedrooms || 0}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Beds
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-800">
              {property.bathrooms || 0}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Baths
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-800">
              {property.area || 0}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Sq. Ft.
            </p>
          </div>
        </div>

        {/* Amenities Preview */}
        {hasAmenities && (
          <div className="mt-4 flex min-h-6 flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={`${amenity}-${index}`}
                className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700"
              >
                {amenity}
              </span>
            ))}

            {property.amenities.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleViewDetails();
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        >
          View Property
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </article>
  );
};

export default PropertyCard;
