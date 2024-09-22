import { useQuery } from "@apollo/client";
import { ALL_BOOKS, GENRES } from "../queries";
import { useState } from "react";

const Books = (props) => {
  const genresQuery = useQuery(GENRES);
  const booksQuery = useQuery(ALL_BOOKS);
  const [displayedGenre, setDisplayedGenre] = useState("all");

  if (!props.show) {
    return null;
  }
  if (booksQuery.loading || genresQuery.loading) {
    return <div>loading...</div>;
  }
  let booksToDisplay = [...booksQuery.data.allBooks];
  const genres = [
    ...new Set(genresQuery.data.allBooks.flatMap((book) => book.genres)),
  ];

  const filterBygenre = (genre) => {
    if (!genre) {
      console.log(genre);
      booksQuery.refetch({ genre: null });
      setDisplayedGenre("all");
      return;
    }
    booksQuery.refetch({ genre });
    setDisplayedGenre(genre);
  };
  const genreButtons = genres.map((genre) => (
    <button key={genre} onClick={() => filterBygenre(genre)}>
      {genre}
    </button>
  ));
  return (
    <div>
      <h2>books</h2>
      <p>
        in genre <strong>{displayedGenre}</strong>
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
      {genreButtons}
      <button onClick={() => filterBygenre()}>all genres</button>
    </div>
  );
};

export default Books;
