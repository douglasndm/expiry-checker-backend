import { getAllUserRoles } from '@utils/UserRoles';

async function getAllStoreTeamsToNotificate(): Promise<
    Array<TeamToNotificate>
> {
    const allRoles = await getAllUserRoles();

    const teamsToNotificate: Array<TeamToNotificate> = [];

    allRoles.forEach(role => {
        // Verifica se o time já existe no array para não adiciona-lo duas vezes
        const teamExists = teamsToNotificate.find(
            teamNote => teamNote.team_id === role.team.id,
        );

        if (!teamExists) {
            teamsToNotificate.push({
                team_id: role.team.id,
                stores: role.team.stores,
            });
        }

        role.user.stores.forEach(userStore => {
            const { store } = userStore;
            // encontra o time onde a loja está adicionada
            const teamWhereStoreIs = teamsToNotificate.findIndex(
                team => team.team_id === store.team.id,
            );

            const storeIndex = teamsToNotificate[
                teamWhereStoreIs
            ].stores.findIndex(sto => sto.id === store.id);

            // Gambiarra para criar um array vazio para adicionar os usuários
            // Já que o response de loja não retorna os usuarios
            if (!teamsToNotificate[teamWhereStoreIs].stores[storeIndex].users) {
                teamsToNotificate[teamWhereStoreIs].stores[
                    storeIndex
                ].users = [];
            }

            teamsToNotificate[teamWhereStoreIs].stores[storeIndex].users.push({
                id: role.user.id,
            });
        });
    });

    teamsToNotificate.forEach(team => {
        team.stores.forEach(store => {
            store.expiredBatches = 0;
            store.nextExpBatches = 0;
        });
    });

    return teamsToNotificate;
}

export { getAllStoreTeamsToNotificate };
