import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/Layouts";
import { Card, Input, Badge, Button, Skeleton } from "../components/UI";
import { searchAPI } from "../services/endpoints";
import { useDebounce } from "../hooks/useCustomHooks";
import toast from "react-hot-toast";

const initialResults = {
  clubs: [],
  colleges: [],
  students: [],
  events: [],
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults(initialResults);
        return;
      }

      setLoading(true);
      try {
        const response = await searchAPI.searchAll(debouncedQuery);
        setResults({
          clubs: response.data?.data?.clubs || [],
          colleges: response.data?.data?.colleges || [],
          students: response.data?.data?.students || [],
          events: response.data?.data?.events || [],
        });
      } catch (error) {
        toast.error("Search failed. Please try again");
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [debouncedQuery]);

  const hasResults =
    results.clubs.length ||
    results.colleges.length ||
    results.students.length ||
    results.events.length;

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover</h1>
        <p className="text-gray-600">
          Search clubs, colleges, students, and events across your campus
        </p>
      </div>

      <Card className="mb-8">
        <Input
          label="Search"
          placeholder='Try "Music Club" or "Design Summit"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-2">
          Results update automatically when you type at least two characters
        </p>
      </Card>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24" count={4} />
        </div>
      )}

      {!loading && !hasResults && debouncedQuery.length >= 2 && (
        <Card className="text-center text-gray-500">
          No results for "{debouncedQuery}". Try a different keyword.
        </Card>
      )}

      {!loading && (
        <div className="space-y-8">
          {results.clubs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Clubs</h2>
                <Badge variant="primary">{results.clubs.length} matches</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.clubs.map((club) => (
                  <Card key={club._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {club.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {club.collegeId?.name || club.college?.name || ""}
                        </p>
                      </div>
                      <Badge variant="gray">{club.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {club.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="success">
                        {club.membersCount || club.members?.length || 0} members
                      </Badge>
                      <Link to={`/clubs/${club._id}`}>
                        <Button variant="ghost" size="sm">
                          View Club →
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.colleges.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Colleges</h2>
                <Badge variant="primary">
                  {results.colleges.length} matches
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.colleges.map((college) => (
                  <Card key={college._id} className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {college.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {college.address || "Address not available"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>🌐 {college.domain || "Domain TBD"}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.students.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Students</h2>
                <Badge variant="primary">
                  {results.students.length} matches
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.students.map((student) => (
                  <Card key={student._id} className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <Badge variant="gray" className="capitalize w-fit">
                      {student.role}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      {student.college?.name || "College not linked"}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.events.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                <Badge variant="primary">{results.events.length} matches</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.events.map((event) => (
                  <Card key={event._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {event.title || event.name}
                      </h3>
                      <Badge variant="success">
                        {new Date(
                          event.startAt || event.startTime
                        ).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {event.location?.name ||
                        event.location?.address ||
                        "Location coming soon"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {event.clubId?.name || "Hosted by TBD"}
                      </span>
                      <Link to={`/events/${event._id}`}>
                        <Button variant="ghost" size="sm">
                          View Event →
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Container>
  );
};

export default SearchPage;
