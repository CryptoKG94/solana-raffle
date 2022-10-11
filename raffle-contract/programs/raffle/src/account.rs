use anchor_lang::prelude::*;



#[account]
#[derive(Default)]
pub struct GlobalState {
    pub admin: Pubkey,
    pub native_vault: Pubkey,
    pub zzz_mint: Pubkey,
    pub raffle_count: u32,
    pub auction_count: u32,
}

#[account]
#[derive(Default)]
pub struct Raffle {
    pub raffle_id: u32,
    pub ticket_count: u32,
    pub sold_tickets: u32,
    pub ticket_price: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub win_ticket_num: u32,
    pub winner: Pubkey,
    pub reward_mint: Pubkey,
    pub project_name: String,
    pub project_description: String,
    pub discord_link: String,
    pub twitter_link: String,
    pub image: String,
    pub wl_spot: u32,
    pub closed: u32,
    pub claimed: u32,
}

#[account]
#[derive(Default)]
// #[repr(packed)]
pub struct BuyerState {
    pub buyer: Pubkey,
    pub raffle_id: u32,
    pub sold_time: i64,
    pub ticket_num_start: u32,
    pub ticket_num_end: u32,
}

#[account]
#[derive(Default)]
pub struct Auction {
    pub auction_id: u32,
    pub seller: Pubkey,
    pub nft_mint: Pubkey,
    pub bidder: Pubkey,
    pub min_bid_amount: u32,
    pub start_time: i64,
    pub end_time: i64,
    pub price: u64,
    pub closed: u32,
    pub bidder_count: u32,
    pub project_name: String,
    pub project_description: String,
}

#[account]
#[derive(Default)]
pub struct BidderState {
    pub auction_id: u32,
    pub bidder: Pubkey,
    pub prev_bidder: Pubkey,
    pub price: u64,
    pub prev_price: u64,
    pub refund_receiver: Pubkey,
}
