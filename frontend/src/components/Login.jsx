import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const Login = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
      setTimeout(() => {
        setError(null);
      }, 5000);
    },
  });
  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      console.log(token);
      setToken(token);
      localStorage.setItem("library-user-token", token);
    }
  }, [result.data]);
  if (!show) {
    return null;
  }
  const submit = async (event) => {
    event.preventDefault();
    setPage("books");
    setUsername("");
    setPassword("");
    login({ variables: { username, password } });
  };
  return (
    <form onSubmit={submit}>
      {error && <div>{error}</div>}
      <h2>Login</h2>
      <div>
        <label>
          username:
          <input
            type="text"
            name="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  );
};
export default Login;
