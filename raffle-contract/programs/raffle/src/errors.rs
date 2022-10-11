use anchor_lang::prelude::*;

#[error_code]
pub enum RaffleError {
    #[msg("Insufficient tickets")]
    InsufficientTickets,

    #[msg("Invalid admin")]
    InvalidAdmin,

    #[msg("Bid price is too low")]
    BidPirceTooLow
}


#[error_code]
pub enum AuctionError {
    #[msg("Bid price is too low")]
    BidPirceTooLow
}