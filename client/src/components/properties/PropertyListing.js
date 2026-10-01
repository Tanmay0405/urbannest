import React, { useCallback, useEffect, useState } from "react";
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            UrbanNest Marketplace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Browse Properties
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-600">
            Explore properties and use the filters below to find a listing that
            matches your requirements.
          </p>
        </header>

        <section className="mb-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Find your property
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Refine your search by location, property type, price, or bedrooms.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Office">Office</option>
                  <option value="Shop">Shop</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Event Space">Event Space</option>
                  <option value="Other">Other</option>
                </select>
              </div>

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
                  <option value="1">1+ bedrooms</option>
                  <option value="2">2+ bedrooms</option>
                  <option value="3">3+ bedrooms</option>
                  <option value="4">4+ bedrooms</option>
                  <option value="5">5+ bedrooms</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Reset Filters
              </button>

              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                Search Properties
              </button>
            </div>
          </form>
        </section>

        {loading && (
          <section
            aria-label="Loading properties"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <div className="h-48 animate-pulse bg-gray-200" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </section>
        )}

        {!loading && error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <h2 className="text-xl font-bold text-red-800">
              Unable to load properties
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchProperties(filters)}
              className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </section>
        )}

        {!loading && !error && properties.length === 0 && (
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto max-w-lg">
              <h2 className="text-xl font-bold text-gray-900">
                No properties found
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                We couldn't find any active properties matching your current
                filters. Try broadening your search.
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            </div>
          </section>
        )}

        {!loading && !error && properties.length > 0 && (
          <section>
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Available Properties
                </h2>

                <p className="text-sm text-gray-500">
                  {properties.length}{" "}
                  {properties.length === 1 ? "property" : "properties"} found
                </p>
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
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600",

  input:
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
};

export default PropertyListing;
