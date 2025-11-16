import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import api from "../services/api.js";

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    api.get("/posts/posts").then((res) => setPosts(res.data.data));
    api
      .get("/posts/announcements")
      .then((res) => setAnnouncements(res.data.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Posts & Announcements</h1>
      <section>
        <h2 className="text-lg font-semibold mb-3">Club Announcements</h2>
        <div className="grid gap-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex justify-between text-sm text-slate-400">
                <span>{post.clubId?.name}</span>
                <span>{post.status}</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{post.title}</h3>
              <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Platform notices</h2>
        <div className="grid gap-3">
          {announcements.map((notice) => (
            <div
              key={notice._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex justify-between text-sm text-slate-400">
                <span>{notice.target}</span>
                <span>{new Date(notice.createdAt).toLocaleString()}</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                {notice.title}
              </h3>
              <p className="text-sm text-slate-300 mt-2">{notice.message}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default PostsPage;
