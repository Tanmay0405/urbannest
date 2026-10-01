import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../PropertyCard";

const initialFilters = {
  search: "",
  city: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
};

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Office",
  "Shop",
  "Warehouse",
  "Event Space",
  "Other",
];

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5"];

const PropertyListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  const getFiltersFromUrl = useCallback(() => {
    return {
      search: searchParams.get("search") || "",
      city: searchParams.get("city") || "",
      propertyType: searchParams.get("propertyType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
    };
  }, [searchParams]);

  const fetchProperties = useCallback(async (activeFilters) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== "") {
          params[key] = value;
        }
      });

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/properties`,
        {
          params,
        },
      );

      setProperties(response.data?.properties || []);
    } catch (err) {
      console.error("FETCH PROPERTIES ERROR:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to load properties. Please try again.",
      );

      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlFilters = getFiltersFromUrl();

    setFilters(urlFilters);
    fetchProperties(urlFilters);
  }, [getFiltersFromUrl, fetchProperties]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    );

    const params = {};

    Object.entries(cleanedFilters).forEach(([key, value]) => {
      if (value !== "") {
        params[key] = value;
      }
    });

    setSearchParams(params);
    fetchProperties(cleanedFilters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setSearchParams({});
    fetchProperties(initialFilters);
  };

  const activeFilters = useMemo(() => {
    return Object.entries(filters).filter(([, value]) => value !== "");
  }, [filters]);

  const getFilterLabel = (key, value) => {
    const labels = {
      search: `Search: ${value}`,
      city: `City: ${value}`,
      propertyType: value,
      minPrice: `Min ₹${Number(value).toLocaleString("en-IN")}`,
      maxPrice: `Max ₹${Number(value).toLocaleString("en-IN")}`,
      bedrooms: `${value}+ bedrooms`,
    };

    return labels[key] || value;
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <header className="mb-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              UrbanNest Marketplace
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Find a place that fits your life.
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Browse verified property listings and narrow your search by
              location, property type, price, and bedrooms.
            </p>
          </div>
        </header>

        {/* Search & Filters */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Find your property
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Use the filters to find listings that match your needs.
                </p>
              </div>

              {activeFilters.length > 0 && (
                <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                  {activeFilters.length}{" "}
                  {activeFilters.length === 1 ? "filter" : "filters"} active
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div>
                <label htmlFor="search" className={styles.label}>
                  Search
                </label>

                <input
                  id="search"
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleChange}
                  placeholder="Property name or location"
                  className={styles.input}
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className={styles.label}>
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  placeholder="e.g. Noida"
                  className={styles.input}
                />
              </div>

              {/* Property Type */}
              <div>
                <label htmlFor="propertyType" className={styles.label}>
                  Property Type
                </label>

                <select
                  id="propertyType"
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="">Any property type</option>

                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimum Price */}
              <div>
                <label htmlFor="minPrice" className={styles.label}>
                  Minimum Price
                </label>

                <input
                  id="minPrice"
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder="₹ Minimum"
                  min="0"
                  className={styles.input}
                />
              </div>

              {/* Maximum Price */}
              <div>
                <label htmlFor="maxPrice" className={styles.label}>
                  Maximum Price
                </label>

                <input
                  id="maxPrice"
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder="₹ Maximum"
                  min="0"
                  className={styles.input}
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label htmlFor="bedrooms" className={styles.label}>
                  Bedrooms
                </label>

                <select
                  id="bedrooms"
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="">Any number</option>

                  {BEDROOM_OPTIONS.map((bedroom) => (
                    <option key={bedroom} value={bedroom}>
                      {bedroom}+ bedrooms
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs text-slate-400 sm:block">
                Search results update using your selected filters.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  Reset Filters
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  Search Properties
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Active Filters */}
        {!loading && activeFilters.length > 0 && (
          <section className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Active filters
              </span>

              {activeFilters.map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                >
                  {getFilterLabel(key, value)}
                </span>
              ))}

              <button
                type="button"
                onClick={handleReset}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Clear all
              </button>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section
            aria-label="Loading properties"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-52 animate-pulse bg-slate-200" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Error */}
        {!loading && error && (
          <section className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0 3.75h.007M10.29 3.86l-7.1 12.28A1.5 1.5 0 004.49 18.4h15.02a1.5 1.5 0 001.3-2.26L13.71 3.86a1.5 1.5 0 00-2.6 0z"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load properties
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchProperties(filters)}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Try Again
            </button>
          </section>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10.5L12 3l9 7.5M5.25 9.5v9.25A1.25 1.25 0 006.5 20h11a1.25 1.25 0 001.25-1.25V9.5M9 20v-5.5h6V20"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No properties found
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              We couldn't find any active properties matching your current
              filters. Try broadening your search.
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Clear Filters
            </button>
          </section>
        )}

        {/* Results */}
        {!loading && !error && properties.length > 0 && (
          <section>
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Property Listings
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  Available Properties
                </h2>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                {properties.length}{" "}
                {properties.length === 1 ? "property" : "properties"} found
              </div>
            </div>

            <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

const styles = {
  label:
    "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600",

  input:
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50",
};

export default PropertyListing;
