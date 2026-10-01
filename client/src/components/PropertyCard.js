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

  return (
    <article
      className="group w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={handleViewDetails}
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">
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

        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
            {property.propertyType || "Property"}
          </span>
        </div>

        {property.status && property.status !== "active" && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-gray-900/80 px-3 py-1.5 text-xs font-semibold capitalize text-white">
              {property.status}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="line-clamp-1 text-lg font-bold text-gray-900">
          {property.title || "Untitled Property"}
        </h2>

        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
          {property.city
            ? `${property.city}${
                property.location ? ` • ${property.location}` : ""
              }`
            : property.location || "Location unavailable"}
        </p>

        <div className="mt-4">
          <p className="text-xl font-extrabold text-indigo-600">
            ₹ {Number(property.price || 0).toLocaleString("en-IN")}
          </p>

          <p className="mt-0.5 text-xs text-gray-400">Listed property price</p>
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-gray-200 rounded-lg bg-gray-50 py-3">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {property.bedrooms || 0}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Beds</p>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {property.bathrooms || 0}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Baths</p>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {property.area || 0}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Sq. Ft.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleViewDetails();
          }}
          className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          View Property
        </button>
      </div>
    </article>
  );
};

export default PropertyCard;
