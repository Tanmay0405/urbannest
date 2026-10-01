const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Unable to restore stored user:", error);

    localStorage.removeItem("user");

    return null;
  }
};

const storedUser = getStoredUser();

const storedUserType = localStorage.getItem("userType");
const storedToken = localStorage.getItem("jwtoken");

const isAuthenticated = Boolean(storedToken && storedUser);

export const initialState = {
  user: isAuthenticated ? storedUser : null,
  userType: isAuthenticated ? storedUserType : null,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "USER":
      if (!action.payload) {
        localStorage.removeItem("user");

        return {
          ...state,
          user: null,
        };
      }

      localStorage.setItem("user", JSON.stringify(action.payload));

      return {
        ...state,
        user: action.payload,
      };

    case "USER_TYPE":
      if (!action.payload) {
        localStorage.removeItem("userType");

        return {
          ...state,
          userType: null,
        };
      }

      localStorage.setItem("userType", action.payload);

      return {
        ...state,
        userType: action.payload,
      };

    default:
      return state;
  }
};
