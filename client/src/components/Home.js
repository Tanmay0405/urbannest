import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PropertyCard from "./PropertyCard";
import Hero from "./hero";

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/properties`,
          {
            params: {
              page: 1,
              limit: 6,
            },
          },
        );

        setProperties(response.data?.properties || []);
      } catch (error) {
        console.error("FEATURED PROPERTIES ERROR:", error);

        setError(
          error.response?.data?.error || "Unable to load featured properties.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  return (
    <main>
      <Hero />

      <section className="bg-gray-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Explore UrbanNest
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Discover Your Dream Property
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Browse verified listings and find a property that fits your
              location, lifestyle, and needs.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Properties
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Explore some of the latest active listings on UrbanNest.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              View All Properties
            </Link>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
              <h3 className="text-lg font-semibold text-red-800">
                Unable to load properties
              </h3>

              <p className="mt-2 text-sm text-red-600">{error}</p>

              <Link
                to="/properties"
                className="mt-5 inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Browse Properties
              </Link>
            </div>
          )}

          {!isLoading && !error && properties.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                No properties available yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                New properties will appear here as they are listed on UrbanNest.
              </p>

              <Link
                to="/properties"
                className="mt-5 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Browse Properties
              </Link>
            </div>
          )}

          {!isLoading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-indigo-600 px-6 py-10 text-center sm:px-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to find your next property?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Explore available listings on UrbanNest and find a property that
              matches what you're looking for.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-gray-100"
            >
              Explore Properties
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
