use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::error::EchoError;
use crate::instruction::EchoInstruction;

pub struct Processor {}

use solana_program::account_info::next_account_info;

impl Processor {
    pub fn process_instruction(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = EchoInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            EchoInstruction::Echo { data } => {
                msg!("Instruction: Echo");
                Err(EchoError::NotImplemented.into())
            }
            EchoInstruction::InitializeAuthorizedEcho {
                buffer_seed,
                buffer_size,
            } => {
                msg!("Instruction: InitializeAuthorizedEcho");
                Err(EchoError::NotImplemented.into())
            }
            EchoInstruction::AuthorizedEcho { data } => {
                msg!("Instruction: AuthorizedEcho");
                Err(EchoError::NotImplemented.into())
            }
            EchoInstruction::InitializeVendingMachineEcho { price, buffer_size } => {
                msg!("Instruction: InitializeVendingMachineEcho");
                Err(EchoError::NotImplemented.into())
            }
            EchoInstruction::VendingMachineEcho { data } => {
                msg!("Instruction: VendingMachineEcho");
                Err(EchoError::NotImplemented.into())
            }
        }
    }
}
