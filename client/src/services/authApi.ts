export const verifyUser = async () => {
  try {
    const response = await fetch(`/api/auth`, {
      method: "GET",
      credentials: "include",
    });
    if (response.status === 401) {
      return false;
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.log(error);
  }
};

export const signUp = async (username: string, password: string) => {
  try {
    const response = await fetch(`/api/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const data = await response.json();
    if (data.id && data.username) {
      return data;
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

export const signIn = async (username: string, password: string) => {
  try {
    const response = await fetch(`/api/auth/signin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const data = await response.json();
    if (data.id && data.username) {
      return data;
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json();
    if (data.message) {
      return data;
    }
    return;
  } catch (error) {
    console.log(error);
  }
};
