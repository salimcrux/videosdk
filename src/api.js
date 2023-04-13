let url = new URL(window.location.href);
let searchParams = new URLSearchParams(url.search);
const token = searchParams.get("token");

const API_BASE_URL = "https://api.videosdk.live";
const VIDEOSDK_TOKEN = token;
//const VIDEOSDK_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlrZXkiOiI2NzFmZGQwYy1iZDc1LTQ0YzUtYjlmOC0xNTZiYThiZDMzNWMiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIiwiYWxsb3dfbW9kIl0sImlhdCI6MTY3OTU2ODg1NiwiZXhwIjoxNjc5NTc5NjU2fQ.vvU-FKJExu6XSPxvkr4NhZG3TMpfl0L29FjSo7EvXjE";
const API_AUTH_URL = process.env.REACT_APP_AUTH_URL;

export const getToken = async () => {
  if (VIDEOSDK_TOKEN && API_AUTH_URL) {
    console.error(
      "Error: Provide only ONE PARAMETER - either Token or Auth API"
    );
  } else if (VIDEOSDK_TOKEN) {
    return VIDEOSDK_TOKEN;
  } else if (API_AUTH_URL) {
    const res = await fetch(`${API_AUTH_URL}/get-token`, {
      method: "GET",
    });
    const { token } = await res.json();
    return token;
  } else {
    console.error("Error: ", Error("Please add a token or Auth Server URL"));
  }
};

// *** commented by Salim
// export const createMeeting = async ({ token }) => {
//   const url = `${API_BASE_URL}/v2/rooms`;
//   const options = {
//     method: "POST",
//     headers: { Authorization: token, "Content-Type": "application/json" },
//   };

//   const { roomId } = await fetch(url, options)
//     .then((response) => response.json())
//     .catch((error) => console.error("error", error));

//   return roomId;
// };

export const validateMeeting = async ({ roomId, token }) => {
  const url = `${API_BASE_URL}/v2/rooms/validate/${roomId}`;

  const options = {
    method: "GET",
    headers: { Authorization: token, "Content-Type": "application/json" },
  };

  const result = await fetch(url, options)
    .then((response) => response.json()) //result will have meeting id
    .catch((error) => console.error("error", error));

  return result ? result.roomId === roomId : false;
};
