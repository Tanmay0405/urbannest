import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const PropertyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
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
    status: "active",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/properties/${id}`,
        );

        const property = response.data.property;

        if (!property) {
          throw new Error("Property not found");
        }

        setFormData({
          title: property.title || "",
          description: property.description || "",
          propertyType: property.propertyType || "Apartment",
          price: property.price ?? "",
          location: property.location || "",
          city: property.city || "",
          bedrooms: property.bedrooms ?? "",
          bathrooms: property.bathrooms ?? "",
          area: property.area ?? "",
          amenities: Array.isArray(property.amenities)
            ? property.amenities.join(", ")
            : "",
          images: Array.isArray(property.images)
            ? property.images.join(", ")
            : "",
          status: property.status || "active",
        });
      } catch (error) {
        console.error("Failed to fetch property:", error);

        toast.error(
          error.response?.data?.message || "Unable to load property.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const token = localStorage.getItem("jwtoken");

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

        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        images: formData.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        status: formData.status,
      };

      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/properties/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Property updated successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      console.error("Failed to update property:", error);

      toast.error(
        error.response?.data?.message || "Unable to update property.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <p style={styles.loadingText}>Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>URBANNEST</p>

            <h1 style={styles.heading}>Edit Property</h1>

            <p style={styles.subheading}>
              Update the information for your property listing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={styles.backButton}
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Basic Information */}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Basic Information</h2>

            <div style={styles.grid}>
              <div style={styles.fullWidth}>
                <label style={styles.label}>Property Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter property title"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the property"
                  required
                  rows="5"
                  style={styles.textarea}
                />
              </div>

              <div>
                <label style={styles.label}>Property Type</label>

                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  style={styles.input}
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

              <div>
                <label style={styles.label}>Price</label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  min="0"
                  required
                  style={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Location */}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Location</h2>

            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Location</label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Sector 62, Noida"
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Noida"
                  required
                  style={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Property Details */}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Property Details</h2>

            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Bedrooms</label>

                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Bathrooms</label>

                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Area (sq.ft.)</label>

                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  min="0"
                  required
                  style={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Amenities & Images */}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Amenities & Images</h2>

            <div style={styles.grid}>
              <div style={styles.fullWidth}>
                <label style={styles.label}>Amenities</label>

                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Parking, Power Backup, Gym, Security"
                  style={styles.input}
                />

                <p style={styles.helpText}>Separate amenities with commas.</p>
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Image URLs</label>

                <textarea
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  rows="4"
                  style={styles.textarea}
                />

                <p style={styles.helpText}>Separate image URLs with commas.</p>
              </div>
            </div>
          </section>

          {/* Status */}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Listing Status</h2>

            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="active">Active</option>

                  <option value="inactive">Inactive</option>

                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
          </section>

          {/* Actions */}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={styles.cancelButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                ...(saving ? styles.disabledButton : {}),
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
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
    padding: "40px 20px 70px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  loadingCard: {
    maxWidth: "1000px",
    margin: "60px auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "60px",
    textAlign: "center",
  },

  loadingText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  eyebrow: {
    margin: "0 0 8px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    color: "#6366f1",
  },

  heading: {
    margin: 0,
    fontSize: "36px",
    lineHeight: "1.2",
    color: "#111827",
  },

  subheading: {
    margin: "10px 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },

  backButton: {
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  section: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "26px",
  },

  sectionTitle: {
    margin: "0 0 22px",
    color: "#111827",
    fontSize: "19px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  fullWidth: {
    gridColumn: "1 / -1",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
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
    padding: "12px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
  },

  helpText: {
    margin: "7px 0 0",
    color: "#9ca3af",
    fontSize: "12px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "4px",
  },

  cancelButton: {
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  saveButton: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    padding: "12px 22px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default PropertyEdit;
