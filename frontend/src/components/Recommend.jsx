import { useQuery } from "@apollo/client";
import { USER } from "../queries";

const Recommend = ({ show }) => {
  const userQuery = useQuery(USER, {
    fetchPolicy: "no-cache", // Always fetch from the network
  });

  if (!show) {
    return null;
  }
  if (userQuery.loading) {
    console.log("Loading");
    return <div>loading...</div>;
  }
  const booksToDisplay = userQuery.data.me.recommend;
  const genre = userQuery.data.me.favoriteGenre;
  console.log(booksToDisplay);
  return (
    <div>
      <h2>recommendations</h2>
      {booksToDisplay.length ? (
        <>
          <p>
            books in your favorite genre <strong>{genre}</strong>
          </p>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>author</th>
                <th>published</th>
              </tr>
              {booksToDisplay.map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>You have no favorite genre</p>
      )}
    </div>
  );
};
export default Recommend;
