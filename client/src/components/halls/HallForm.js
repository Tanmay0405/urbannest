import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const HallForm = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [propertyData, setPropertyData] = useState({
    title: "",
    description: "",
    propertyType: "Apartment",
    price: "",
    location: "",
    city: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    amenities: "",
    images: "",
  });

  const handleInputs = (e) => {
    const { name, value } = e.target;

    setPropertyData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const createProperty = async (e) => {
    e.preventDefault();

    const {
      title,
      description,
      propertyType,
      price,
      location,
      city,
      bedrooms,
      bathrooms,
      area,
      amenities,
      images,
    } = propertyData;

    if (
      !title ||
      !description ||
      !propertyType ||
      !price ||
      !location ||
      !city ||
      !area
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setIsLoading(true);

      const token = localStorage.getItem("jwtoken");

      if (!token) {
        toast.error("Please login as a seller first.");
        navigate("/login");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        propertyType,
        price: Number(price),
        location: location.trim(),
        city: city.trim(),
        bedrooms: bedrooms ? Number(bedrooms) : 0,
        bathrooms: bathrooms ? Number(bathrooms) : 0,
        area: Number(area),
        amenities: amenities
          ? amenities
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        images: images
          ? images
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/properties`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data?.success) {
        toast.success("Property listed successfully!");
        navigate("/dashboard");
      } else {
        toast.error(response.data?.message || "Unable to create property.");
      }
    } catch (error) {
      console.error("Create property error:", error);

      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        localStorage.removeItem("jwtoken");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("Only sellers can create properties.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Unable to create property. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>URBANNEST SELLER</p>

          <h1 style={styles.heading}>List Your Property</h1>

          <p style={styles.subheading}>
            Add complete property information so buyers can discover your
            listing.
          </p>
        </div>

        <form onSubmit={createProperty} style={styles.form}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Basic Information</h2>

            <div style={styles.field}>
              <label style={styles.label}>Property Title *</label>

              <input
                type="text"
                name="title"
                value={propertyData.title}
                onChange={handleInputs}
                placeholder="e.g. Modern 2BHK Apartment in Noida"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description *</label>

              <textarea
                name="description"
                value={propertyData.description}
                onChange={handleInputs}
                placeholder="Describe the property, nearby facilities, features, etc."
                style={styles.textarea}
                rows="5"
                required
              />
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>Property Type *</label>

                <select
                  name="propertyType"
                  value={propertyData.propertyType}
                  onChange={handleInputs}
                  style={styles.input}
                  required
                >
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

              <div style={styles.field}>
                <label style={styles.label}>Price *</label>

                <input
                  type="number"
                  name="price"
                  value={propertyData.price}
                  onChange={handleInputs}
                  placeholder="e.g. 28000"
                  min="0"
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Location</h2>

            <div style={styles.field}>
              <label style={styles.label}>Location / Address *</label>

              <input
                type="text"
                name="location"
                value={propertyData.location}
                onChange={handleInputs}
                placeholder="e.g. Sector 62, Near Metro Station"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>City *</label>

              <input
                type="text"
                name="city"
                value={propertyData.city}
                onChange={handleInputs}
                placeholder="e.g. Noida"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Property Details</h2>

            <div style={styles.threeColumn}>
              <div style={styles.field}>
                <label style={styles.label}>Bedrooms</label>

                <input
                  type="number"
                  name="bedrooms"
                  value={propertyData.bedrooms}
                  onChange={handleInputs}
                  placeholder="0"
                  min="0"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Bathrooms</label>

                <input
                  type="number"
                  name="bathrooms"
                  value={propertyData.bathrooms}
                  onChange={handleInputs}
                  placeholder="0"
                  min="0"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Area (sq. ft.) *</label>

                <input
                  type="number"
                  name="area"
                  value={propertyData.area}
                  onChange={handleInputs}
                  placeholder="e.g. 1200"
                  min="0"
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Amenities & Images</h2>

            <div style={styles.field}>
              <label style={styles.label}>Amenities</label>

              <input
                type="text"
                name="amenities"
                value={propertyData.amenities}
                onChange={handleInputs}
                placeholder="Parking, WiFi, Power Backup, Security"
                style={styles.input}
              />

              <p style={styles.helper}>
                Separate multiple amenities with commas.
              </p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Image URLs</label>

              <textarea
                name="images"
                value={propertyData.images}
                onChange={handleInputs}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                style={styles.textarea}
                rows="4"
              />

              <p style={styles.helper}>
                Add image URLs separated by commas. Image upload will be added
                later.
              </p>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate("/sellerDashboard")}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "Listing Property..." : "List Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7f8fc",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "32px",
  },

  eyebrow: {
    margin: "0 0 8px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    color: "#6366f1",
  },

  heading: {
    margin: "0",
    fontSize: "36px",
    lineHeight: "1.15",
    color: "#111827",
  },

  subheading: {
    margin: "10px 0 0",
    color: "#6b7280",
    fontSize: "16px",
    lineHeight: "1.6",
  },

  form: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "32px",
    boxSizing: "border-box",
  },

  section: {
    marginBottom: "32px",
    paddingBottom: "28px",
    borderBottom: "1px solid #e5e7eb",
  },

  sectionTitle: {
    margin: "0 0 22px",
    fontSize: "20px",
    color: "#111827",
  },

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
  },

  helper: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "12px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  threeColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },

  cancelButton: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "9px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  submitButton: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    padding: "12px 22px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default HallForm;
