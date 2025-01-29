import { getAllUserRoles } from '@utils/UserRoles';

async function getAllStoreTeamsToNotificate(): Promise<
	Array<TeamToNotificate>
> {
	const allRoles = await getAllUserRoles();

	const teamsToNotificate: Array<TeamToNotificate> = [];

	allRoles.forEach(role => {
		// Verifica se o time já existe no array para não adiciona-lo duas vezes
		const teamExists = teamsToNotificate.find(
			teamNote => teamNote.team_id === role.team.id
		);

		if (!teamExists) {
			teamsToNotificate.push({
				team_id: role.team.id,
				stores: role.team.stores,
				noStore: { users: [], expiredBatches: 0, nextExpBatches: 0 },
			});
		}

		// se o usuário não tiver lojas, será adicionado ao time
		// sem loja
		if (!role.user.store) {
			const teamIndex = teamsToNotificate.findIndex(
				team => team.team_id === role.team.id
			);

			teamsToNotificate[teamIndex].noStore.users.push({
				id: role.user.id,
			});
		} else {
			const { store } = role.user.store;

			// encontra o time onde a loja está adicionada
			const teamWhereStoreIs = teamsToNotificate.findIndex(
				team => team.team_id === store.team.id
			);

			// For some reasons in production we have stores without a team
			if (teamWhereStoreIs < 0) {
				return;
			}

			if (!store) {
				teamsToNotificate[teamWhereStoreIs].noStore.users.push({
					id: role.user.id,
				});
				return;
			}

			if (!teamsToNotificate[teamWhereStoreIs].stores) return;

			const storeIndex = teamsToNotificate[
				teamWhereStoreIs
			].stores.findIndex(sto => sto.id === store.id);

			// Gambiarra para criar um array vazio para adicionar os usuários
			// Já que o response de loja não retorna os usuarios
			if (!teamsToNotificate[teamWhereStoreIs].stores[storeIndex].users) {
				teamsToNotificate[teamWhereStoreIs].stores[storeIndex].users =
					[];
			}

			teamsToNotificate[teamWhereStoreIs].stores[storeIndex].users.push({
				id: role.user.id,
			});
		}
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
