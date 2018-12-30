Modified version of anonymous voting described in article:
https://medium.com/commonwealth-labs/anonymous-voting-a-design-survey-12de869dc97f

The goal is to not be able to know who is participating in the poll, so instead tying votes to addresses or identities,
we are tying them to some secret value that is inside a merkle tree. The leaf nodes of the tree are not saved on the chain
and can't be derived from the data that is saved on the chain. User that inserts the value to the tree is the only person
that knows the real value.
Solving the problem of one person voting multiple times is not the goal of this repo.

TODO: Right now merkle proof is used to proof that the secret is in merkle tree. In order for voting to be anonymous this needs to be replaced with zero knowlage proof.
