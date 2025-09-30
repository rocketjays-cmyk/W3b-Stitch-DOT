#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod anchor {
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct Anchor {
        /// Mapping from file hash to account that anchored it
        anchors: Mapping<Hash, AccountId>,
    }

    impl Anchor {
        /// Constructor initializes storage
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { anchors: Mapping::default() }
        }

        /// Anchor a file hash on-chain
        #[ink(message)]
        pub fn anchor(&mut self, hash: Hash) {
            let caller = self.env().caller();
            self.anchors.insert(hash, &caller);
        }

        /// Verify if a hash exists and return the owner
        #[ink(message)]
        pub fn verify(&self, hash: Hash) -> Option<AccountId> {
            self.anchors.get(hash)
        }
    }
}
