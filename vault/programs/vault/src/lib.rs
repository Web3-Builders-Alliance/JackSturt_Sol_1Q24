use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("7V42QpFBf29UuhVGMf4hBxLS3fNgFzjTKX8PaUKGt7hn");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.vault_state.maker = ctx.accounts.maker.key();
        ctx.accounts.vault_state.taker = ctx.accounts.taker.key();
        ctx.accounts.vault_state.state_bump = ctx.bumps.vault_state;
        ctx.accounts.vault_state.vault_bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.maker.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.system_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);

        transfer(cpi_context, amount)
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.maker.to_account_info(),
        };
        let cpi_program = ctx.accounts.system_program.to_account_info();
        let bump = ctx.accounts.vault_state.vault_bump;
        let seeds = &[
            "vault".as_bytes(),
            &ctx.accounts.vault_state.maker.to_bytes(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        let amount = ctx.accounts.vault.to_account_info().lamports();

        transfer(cpi_context, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.taker.to_account_info(),
        };
        let cpi_program = ctx.accounts.system_program.to_account_info();
        let bump = ctx.accounts.vault_state.vault_bump;
        let seeds = &[
            "vault".as_bytes(),
            &ctx.accounts.vault_state.maker.to_bytes(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        let amount = ctx.accounts.vault.to_account_info().lamports();

        transfer(cpi_context, amount)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        init,
        seeds = [b"VaultState",maker.key().as_ref()],
        bump,
        payer=maker,
        space = VaultState::INIT_SPACE,
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub taker: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct VaultState {
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub state_bump: u8,
    pub vault_bump: u8,
}

impl Space for VaultState {
    const INIT_SPACE: usize = 8 + 32 + 32 + 1 + 1;
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"VaultState",maker.key().as_ref()],
        bump,
        has_one=maker,
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"VaultState",maker.key().as_ref()],
        bump,
        has_one=maker,
        close=maker,
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub maker: SystemAccount<'info>,
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"VaultState",maker.key().as_ref()],
        bump,
        has_one=taker,
        close=maker,
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}
