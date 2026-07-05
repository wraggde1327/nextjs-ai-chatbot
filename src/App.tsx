import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { HomePage } from "@/pages/home";
import { BooksPage } from "@/pages/books/index";
import { BookDetailPage } from "@/pages/books/book-detail";
import { PollsPage } from "@/pages/polls/index";
import { EventsPage } from "@/pages/events/index";
import { ChatPage } from "@/pages/chat/index";
import { ThreadPage } from "@/pages/chat/thread";
import { ContestsPage } from "@/pages/contests/index";
import { MorePage } from "@/pages/more";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/polls" element={<PollsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:threadId" element={<ThreadPage />} />
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/more" element={<MorePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
