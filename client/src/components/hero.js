import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (city.trim()) {
      params.set("city", city.trim());
    }

    if (propertyType) {
      params.set("propertyType", propertyType);
    }

    const query = params.toString();

    navigate(query ? `/properties?${query}` : "/properties");
  };

  const handleExplore = () => {
    navigate("/properties");
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="relative min-h-[620px] bg-cover bg-center sm:min-h-[680px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2')",
        }}
      >
        {/* Darker overlay on the left for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-4 py-16 sm:min-h-[680px] sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Welcome to UrbanNest
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find a place that
              <span className="block text-indigo-300">feels like home.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white sm:text-lg">
              Discover properties that match your lifestyle, location, and
              budget. Explore listings and find your next place with UrbanNest.
            </p>

            <button
              type="button"
              onClick={handleExplore}
              className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Explore Properties
            </button>
          </div>

          <div className="mt-12 w-full max-w-5xl">
            <form
              onSubmit={handleSearch}
              className="rounded-2xl bg-white p-4 shadow-2xl sm:p-5"
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Search properties
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Start with a location, property type, or keyword.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
                <div>
                  <label
                    htmlFor="hero-search"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Search
                  </label>

                  <input
                    id="hero-search"
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Property name or location"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hero-city"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    City
                  </label>

                  <input
                    id="hero-city"
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="e.g. Noida"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hero-property-type"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Property Type
                  </label>

                  <select
                    id="hero-property-type"
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Any type</option>
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

                <button
                  type="submit"
                  className="self-end rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
