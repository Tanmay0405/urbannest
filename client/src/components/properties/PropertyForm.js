import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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

const INITIAL_FORM = {
  title: "",
  description: "",
  propertyType: "Apartment",
  price: "",
  location: "",
  city: "",
  bedrooms: "0",
  bathrooms: "0",
  area: "",
  amenities: "",
  images: "",
  status: "active",
};

const PropertyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("jwtoken");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (!token || userType !== "seller") {
      navigate("/login");
      return;
    }

    if (!isEditMode) {
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/seller/properties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const properties = response.data?.properties || [];

        const property = properties.find((item) => item._id === id);

        if (!property) {
          throw new Error(
            "Property not found or you do not have access to it.",
          );
        }

        setFormData({
          title: property.title || "",
          description: property.description || "",
          propertyType: property.propertyType || "Apartment",
          price: property.price ?? "",
          location: property.location || "",
          city: property.city || "",
          bedrooms: property.bedrooms ?? "0",
          bathrooms: property.bathrooms ?? "0",
          area: property.area ?? "",
          amenities: Array.isArray(property.amenities)
            ? property.amenities.join(", ")
            : "",
          images: Array.isArray(property.images)
            ? property.images.join("\n")
            : "",
          status: property.status || "active",
        });
      } catch (err) {
        console.error("LOAD PROPERTY ERROR:", err);

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Unable to load this property.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, isEditMode, navigate, token, userType]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Property title is required.";
    }

    if (!formData.description.trim()) {
      return "Property description is required.";
    }

    if (!formData.propertyType) {
      return "Please select a property type.";
    }

    if (!formData.location.trim()) {
      return "Location is required.";
    }

    if (!formData.city.trim()) {
      return "City is required.";
    }

    if (
      formData.price === "" ||
      Number.isNaN(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      return "Please enter a valid price.";
    }

    if (
      formData.area === "" ||
      Number.isNaN(Number(formData.area)) ||
      Number(formData.area) <= 0
    ) {
      return "Please enter a valid area.";
    }

    if (
      Number.isNaN(Number(formData.bedrooms)) ||
      Number(formData.bedrooms) < 0
    ) {
      return "Bedrooms cannot be negative.";
    }

    if (
      Number.isNaN(Number(formData.bathrooms)) ||
      Number(formData.bathrooms) < 0
    ) {
      return "Bathrooms cannot be negative.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token || userType !== "seller") {
      setError("Your seller session is no longer valid. Please sign in again.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const amenities = formData.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const images = formData.images
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      propertyType: formData.propertyType,
      price: Number(formData.price),
      location: formData.location.trim(),
      city: formData.city.trim(),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: Number(formData.area),
      amenities,
      images,
    };

    /*
     * Sellers can manage active/inactive status.
     * A sold property is controlled by the backend/admin,
     * so do not send status: "sold" from the seller form.
     */
    if (isEditMode && formData.status !== "sold") {
      payload.status = formData.status;
    }

    try {
      if (isEditMode) {
        await axios.put(
          `${process.env.REACT_APP_SERVER_URL}/properties/${id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSuccess("Property updated successfully.");

        setTimeout(() => {
          navigate("/dashboard");
        }, 700);
      } else {
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/properties`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSuccess("Property listed successfully.");

        setTimeout(() => {
          navigate("/dashboard");
        }, 700);
      }
    } catch (err) {
      console.error("SAVE PROPERTY ERROR:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to save the property. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200" />

            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-gray-200" />

            <div className="mt-10 space-y-5">
              <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-32 animate-pulse rounded-lg bg-gray-200" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          <span className="text-lg">←</span>
          Back to Dashboard
        </button>

        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            {isEditMode ? "Edit Listing" : "New Listing"}
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {isEditMode ? "Edit Your Property" : "List Your Property"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            {isEditMode
              ? "Keep your UrbanNest listing accurate and up to date."
              : "Add your property to the UrbanNest marketplace and make it discoverable to buyers."}
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
          >
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
        >
          {/* Basic information */}
          <section className="border-b border-gray-100 p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Give buyers the key information about your property.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Property Title *
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Premium 3 BHK Apartment"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Description *
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the property, its condition, highlights, and nearby facilities..."
                  rows={6}
                  required
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="propertyType"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Property Type *
                  </label>

                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Price *
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                      ₹
                    </span>

                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="2500000"
                      required
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="border-b border-gray-100 p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Location</h2>

              <p className="mt-1 text-sm text-gray-500">
                Help buyers understand where the property is located.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Location / Address *
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Sector 62, Noida"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  City *
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Noida"
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Property details */}
          <section className="border-b border-gray-100 p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Property Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add the dimensions and core features of the property.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="bedrooms"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Bedrooms
                </label>

                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="bathrooms"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Bathrooms
                </label>

                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="area"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Area (sq. ft.) *
                </label>

                <input
                  id="area"
                  name="area"
                  type="number"
                  min="0"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="1200"
                  required
                  className={inputClass}
                />
              </div>

              {isEditMode && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Listing Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={formData.status === "sold"}
                    className={`${inputClass} ${
                      formData.status === "sold"
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  >
                    <option value="active">Active</option>

                    <option value="inactive">Inactive</option>

                    {formData.status === "sold" && (
                      <option value="sold">Sold</option>
                    )}
                  </select>

                  {formData.status === "sold" && (
                    <p className="mt-2 text-xs text-gray-500">
                      This property is marked as sold. Sold status is managed by
                      an administrator.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Amenities and images */}
          <section className="p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Amenities & Images
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add useful features and image links to make your listing more
                informative.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="amenities"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Amenities
                </label>

                <input
                  id="amenities"
                  name="amenities"
                  type="text"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Parking, Security, Power Backup, Gym"
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-gray-400">
                  Separate multiple amenities with commas.
                </p>
              </div>

              <div>
                <label
                  htmlFor="images"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Image URLs
                </label>

                <textarea
                  id="images"
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  placeholder={
                    "https://example.com/property-1.jpg\nhttps://example.com/property-2.jpg"
                  }
                  rows={5}
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-xs text-gray-400">
                  Add one image URL per line. Comma-separated URLs are also
                  supported.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-5 sm:flex-row sm:justify-end sm:p-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={submitting}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : isEditMode
                  ? "Update Property"
                  : "Publish Property"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default PropertyForm;
