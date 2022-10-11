import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Details from "../screens/Raffle Details";
import RaffleList from "../screens/Raffle List";
import Stake from "../screens/Staking";
import Form from "../screens/Form";
import AuctionForm from "../screens/AuctionForm";

const RouterProvider = () => {
  return (
    <div style={{ padding: "1em 0", width: "100%" }}>
      <BrowserRouter>
        <nav>
          <Header />
        </nav>

        <Routes>
          <Route path="/" element={<RaffleList />} />
          <Route path="/details/:id/:type" element={<Details />} />
          <Route path="/stake" element={<Stake />} />
          <Route path="/form" element={<Form />} />
          <Route path='/auction-form' element={<AuctionForm />} />
        </Routes>
        <footer className="app-footer">
          <Footer />
        </footer>
      </BrowserRouter>
    </div>
  );
};

export default RouterProvider;
