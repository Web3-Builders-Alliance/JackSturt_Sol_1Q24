use anchor_lang::prelude::*;

declare_id!("DM9fthSihjvinc18oCadUsb8UkExPEq3qS8MKU9fKQbc");

pub mod contexts;
pub mod state;

pub use contexts::*;

#[program]
pub mod anchor_escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, amount_x: u64, amount_y: u64) -> Result<()> {
        Make::make(ctx.accounts, seed, amount_x, amount_y, &ctx.bumps)?;
        Ok(())
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        Refund::empty_vault(ctx.accounts)?;
        Refund::close_vault(ctx.accounts)?;
        Ok(())
    }

    pub fn schwap(ctx: Context<Take>) -> Result<()> {
        Take::vault_to_taker(ctx.accounts)?;
        Take::taker_to_maker(ctx.accounts)?;
        Take::close_vault(ctx.accounts)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
