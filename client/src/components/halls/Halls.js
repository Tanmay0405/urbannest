import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";

const Halls = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteError, setFavoriteError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    city: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
  });

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const token = localStorage.getItem("jwtoken");
  const userType = localStorage.getItem("userType");

  const getProperties = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params = {
        page,
        limit: 12,
      };

      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      if (filters.city.trim()) {
        params.city = filters.city.trim();
      }

      if (filters.propertyType) {
        params.propertyType = filters.propertyType;
      }

      if (filters.minPrice !== "") {
        params.minPrice = filters.minPrice;
      }

      if (filters.maxPrice !== "") {
        params.maxPrice = filters.maxPrice;
      }

      if (filters.bedrooms !== "") {
        params.bedrooms = filters.bedrooms;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/properties`,
        {
          params,
        },
      );

      setProperties(response.data.properties || []);

      setPagination(
        response.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Failed to fetch properties:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load properties. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFavorites = async () => {
    if (!token || userType !== "buyer") {
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

      const favorites = response.data.favorites || [];

      const ids = favorites.map((property) =>
        typeof property === "string" ? property : property._id,
      );

      setFavoriteIds(ids);
    } catch (error) {
      console.error(
        "Failed to fetch favorites:",
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    getProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  useEffect(() => {
    getFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setPage(1);

    setFilters((previousFilters) => ({
      ...previousFilters,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setPage(1);

    setFilters({
      search: "",
      city: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
    });
  };

  const handleFavorite = async (propertyId) => {
    if (!token || userType !== "buyer") {
      navigate("/login");
      return;
    }

    setFavoriteError("");

    const isFavorite = favoriteIds.includes(propertyId);

    // Optimistic UI update
    if (isFavorite) {
      setFavoriteIds((previousIds) =>
        previousIds.filter((id) => id !== propertyId),
      );
    } else {
      setFavoriteIds((previousIds) => [...previousIds, propertyId]);
    }

    try {
      let response;

      if (isFavorite) {
        response = await axios.delete(
          `${process.env.REACT_APP_SERVER_URL}/favorites/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/favorites/${propertyId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      // Sync UI with server response
      if (response.data.favorites) {
        const serverFavorites = response.data.favorites.map((favorite) =>
          typeof favorite === "string" ? favorite : favorite._id,
        );

        setFavoriteIds(serverFavorites);
      }
    } catch (error) {
      console.error(
        "Favorite action failed:",
        error.response?.data || error.message,
      );

      // Roll back optimistic update
      if (isFavorite) {
        setFavoriteIds((previousIds) => [...previousIds, propertyId]);
      } else {
        setFavoriteIds((previousIds) =>
          previousIds.filter((id) => id !== propertyId),
        );
      }

      setFavoriteError(
        error.response?.data?.message ||
          "Unable to update favorite. Please try again.",
      );
    }
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPage((previousPage) => previousPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPage((previousPage) => previousPage + 1);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>URBANNEST</p>

            <h1 style={styles.title}>
              Find a place that feels like
              <span style={styles.titleAccent}> home.</span>
            </h1>

            <p style={styles.subtitle}>
              Explore properties listed by sellers and find the right place for
              your needs.
            </p>
          </div>

          <div style={styles.propertyCount}>
            <span style={styles.countNumber}>{pagination.total}</span>

            <span style={styles.countLabel}>
              {pagination.total === 1 ? "Property" : "Properties"}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <div>
              <h2 style={styles.filterTitle}>Find your property</h2>

              <p style={styles.filterSubtitle}>
                Search and refine your property results.
              </p>
            </div>

            <button onClick={resetFilters} style={styles.resetButton}>
              Reset Filters
            </button>
          </div>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>⌕</span>

            <input
              type="text"
              value={filters.search}
              placeholder="Search by property name, city, location, or description..."
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>City</label>

              <input
                type="text"
                value={filters.city}
                placeholder="e.g. Noida"
                onChange={(e) => handleFilterChange("city", e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Property Type</label>

              <select
                value={filters.propertyType}
                onChange={(e) =>
                  handleFilterChange("propertyType", e.target.value)
                }
                style={styles.input}
              >
                <option value="">All Types</option>
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

            <div style={styles.inputGroup}>
              <label style={styles.label}>Minimum Price</label>

              <input
                type="number"
                min="0"
                value={filters.minPrice}
                placeholder="₹ Minimum"
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Maximum Price</label>

              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                placeholder="₹ Maximum"
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Bedrooms</label>

              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                style={styles.input}
              >
                <option value="">Any</option>
                <option value="1">1+ Bedroom</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>
          </div>
        </div>

        {/* Favorite Error */}
        {favoriteError && (
          <div style={styles.favoriteError}>{favoriteError}</div>
        )}

        {/* General Error */}
        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>

            <button onClick={getProperties} style={styles.retryButton}>
              Try Again
            </button>
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && !error && properties.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⌂</div>

            <h2 style={styles.emptyTitle}>No properties found</h2>

            <p style={styles.emptyText}>Try changing your search or filters.</p>

            <button onClick={resetFilters} style={styles.emptyButton}>
              Clear Filters
            </button>
          </div>
        )}

        {!isLoading && !error && properties.length > 0 && (
          <>
            <div style={styles.resultsHeader}>
              <div>
                <h2 style={styles.resultsTitle}>Available Properties</h2>

                <p style={styles.resultsSubtitle}>
                  Showing {properties.length} of {pagination.total} properties
                </p>
              </div>

              {pagination.totalPages > 1 && (
                <span style={styles.pageInfo}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              )}
            </div>

            <div style={styles.grid}>
              {properties.map((property) => {
                const image =
                  property.images && property.images.length > 0
                    ? property.images[0]
                    : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

                const isFavorite = favoriteIds.includes(property._id);

                return (
                  <div key={property._id} style={styles.card}>
                    <div style={styles.imageWrapper}>
                      <img
                        src={image}
                        alt={property.title}
                        style={styles.image}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />

                      <div style={styles.typeBadge}>
                        {property.propertyType}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleFavorite(property._id)}
                        style={{
                          ...styles.heartButton,
                          ...(isFavorite ? styles.favoriteActive : {}),
                        }}
                        title={
                          isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {isFavorite ? "♥" : "♡"}
                      </button>
                    </div>

                    <div style={styles.cardContent}>
                      <div style={styles.priceRow}>
                        <h2 style={styles.price}>
                          ₹{Number(property.price || 0).toLocaleString("en-IN")}
                        </h2>

                        <span style={styles.priceLabel}>per listing</span>
                      </div>

                      <h3 style={styles.propertyTitle}>{property.title}</h3>

                      <p style={styles.location}>
                        <span style={styles.locationIcon}>⌖</span>
                        {property.location}, {property.city}
                      </p>

                      <p style={styles.description}>{property.description}</p>

                      <div style={styles.stats}>
                        <div style={styles.stat}>
                          <strong style={styles.statValue}>
                            {property.bedrooms || 0}
                          </strong>

                          <span>Bedrooms</span>
                        </div>

                        <div style={styles.divider} />

                        <div style={styles.stat}>
                          <strong style={styles.statValue}>
                            {property.bathrooms || 0}
                          </strong>

                          <span>Bathrooms</span>
                        </div>

                        <div style={styles.divider} />

                        <div style={styles.stat}>
                          <strong style={styles.statValue}>
                            {property.area || 0}
                          </strong>

                          <span>sq.ft.</span>
                        </div>
                      </div>

                      {property.amenities && property.amenities.length > 0 && (
                        <div style={styles.amenities}>
                          {property.amenities
                            .slice(0, 3)
                            .map((amenity, index) => (
                              <span key={index} style={styles.amenity}>
                                {amenity}
                              </span>
                            ))}

                          {property.amenities.length > 3 && (
                            <span style={styles.amenity}>
                              +{property.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        style={styles.viewButton}
                        onClick={() => handleViewProperty(property._id)}
                      >
                        View Property
                        <span style={styles.arrow}>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={pagination.page === 1}
                  style={{
                    ...styles.paginationButton,
                    ...(pagination.page === 1 ? styles.disabledButton : {}),
                  }}
                >
                  ← Previous
                </button>

                <span style={styles.paginationText}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.totalPages}
                  style={{
                    ...styles.paginationButton,
                    ...(pagination.page === pagination.totalPages
                      ? styles.disabledButton
                      : {}),
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fc",
    padding: "40px 20px 70px",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "30px",
  },

  eyebrow: {
    margin: "0 0 10px",
    color: "#4f46e5",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  title: {
    margin: 0,
    color: "#18181b",
    fontSize: "clamp(32px, 5vw, 52px)",
    lineHeight: 1.05,
    fontWeight: "800",
  },

  titleAccent: {
    color: "#4f46e5",
  },

  subtitle: {
    maxWidth: "650px",
    margin: "18px 0 0",
    color: "#71717a",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  propertyCount: {
    minWidth: "130px",
    padding: "18px 22px",
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: "16px",
    textAlign: "center",
  },

  countNumber: {
    display: "block",
    color: "#4f46e5",
    fontSize: "30px",
    fontWeight: "800",
  },

  countLabel: {
    display: "block",
    marginTop: "3px",
    color: "#71717a",
    fontSize: "13px",
  },

  filterCard: {
    marginBottom: "25px",
    padding: "25px",
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: "20px",
  },

  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "22px",
  },

  filterTitle: {
    margin: 0,
    color: "#27272a",
    fontSize: "20px",
  },

  filterSubtitle: {
    margin: "5px 0 0",
    color: "#71717a",
    fontSize: "13px",
  },

  resetButton: {
    padding: "9px 15px",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    background: "#eef2ff",
    color: "#4338ca",
    fontWeight: "700",
    cursor: "pointer",
  },

  searchWrapper: {
    position: "relative",
    marginBottom: "18px",
  },

  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6366f1",
    fontSize: "22px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px 14px 45px",
    border: "1px solid #c7d2fe",
    borderRadius: "12px",
    background: "#fafaff",
    fontSize: "14px",
    outline: "none",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#3f3f46",
    fontSize: "12px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d4d4d8",
    borderRadius: "10px",
    background: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },

  favoriteError: {
    marginBottom: "20px",
    padding: "12px 16px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    color: "#991b1b",
    fontSize: "13px",
    fontWeight: "600",
  },

  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "18px",
  },

  resultsTitle: {
    margin: 0,
    color: "#27272a",
    fontSize: "23px",
  },

  resultsSubtitle: {
    margin: "5px 0 0",
    color: "#71717a",
    fontSize: "13px",
  },

  pageInfo: {
    color: "#71717a",
    fontSize: "13px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "28px",
  },

  card: {
    overflow: "hidden",
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: "22px",
    boxShadow: "0 10px 35px rgba(15, 23, 42, 0.07)",
  },

  imageWrapper: {
    position: "relative",
    height: "235px",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  typeBadge: {
    position: "absolute",
    top: "15px",
    left: "15px",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.94)",
    color: "#27272a",
    fontSize: "12px",
    fontWeight: "700",
  },

  heartButton: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "42px",
    height: "42px",
    border: "none",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#52525b",
    fontSize: "23px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
  },

  favoriteActive: {
    color: "#ef4444",
  },

  cardContent: {
    padding: "23px",
  },

  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "7px",
  },

  price: {
    margin: 0,
    color: "#18181b",
    fontSize: "25px",
  },

  priceLabel: {
    color: "#a1a1aa",
    fontSize: "12px",
  },

  propertyTitle: {
    margin: "13px 0 7px",
    color: "#27272a",
    fontSize: "19px",
  },

  location: {
    margin: 0,
    color: "#71717a",
    fontSize: "14px",
  },

  locationIcon: {
    marginRight: "5px",
    color: "#4f46e5",
  },

  description: {
    margin: "17px 0 0",
    color: "#71717a",
    fontSize: "14px",
    lineHeight: 1.6,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  stats: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "20px",
    padding: "16px 0",
    borderTop: "1px solid #f0f0f2",
    borderBottom: "1px solid #f0f0f2",
  },

  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    flex: 1,
    color: "#71717a",
    fontSize: "11px",
  },

  statValue: {
    color: "#27272a",
    fontSize: "15px",
  },

  divider: {
    width: "1px",
    height: "30px",
    background: "#e4e4e7",
  },

  amenities: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "17px",
  },

  amenity: {
    padding: "6px 9px",
    borderRadius: "8px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "11px",
  },

  viewButton: {
    width: "100%",
    marginTop: "20px",
    padding: "13px 16px",
    border: "none",
    borderRadius: "12px",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  arrow: {
    marginLeft: "8px",
  },

  errorBox: {
    padding: "25px",
    background: "#ffffff",
    border: "1px solid #fecaca",
    borderRadius: "18px",
    textAlign: "center",
  },

  errorText: {
    color: "#991b1b",
  },

  retryButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyState: {
    padding: "60px 20px",
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: "20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "45px",
    color: "#a5b4fc",
  },

  emptyTitle: {
    color: "#27272a",
  },

  emptyText: {
    color: "#71717a",
  },

  emptyButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "18px",
    marginTop: "40px",
  },

  paginationButton: {
    padding: "10px 16px",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#4338ca",
    fontWeight: "700",
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  paginationText: {
    color: "#52525b",
    fontSize: "13px",
  },
};

export default Halls;
