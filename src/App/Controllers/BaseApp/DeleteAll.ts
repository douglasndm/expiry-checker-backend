import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase';

class DeleteAll {
    async delete(req: Request, res: Response): Promise<Response> {
        const email = req.userEmail;

        if (!email) {
            return res.status(401).send();
        }

        const db = firestore(firebaseAppExpiryChecker);

        // Função para excluir todos os documentos de uma coleção
        async function deleteCollection(
            collectionRef:
                | FirebaseFirestore.CollectionReference
                | FirebaseFirestore.Query,
            batchSize: number,
        ): Promise<void> {
            const snapshot = await collectionRef.limit(batchSize).get();

            if (snapshot.size === 0) return;

            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));

            await batch.commit();

            // Recursivamente excluir os documentos restantes
            await deleteCollection(collectionRef, batchSize);
        }

        // Função para excluir todos os dados do usuário
        async function deleteUserData(mail: string): Promise<void> {
            const userRef = db.collection('users').doc(mail);

            const userCollections = await userRef.listCollections();

            // Exclua os documentos de todas as coleções do usuário
            await Promise.all(
                userCollections.map(async collection => {
                    await deleteCollection(collection, 50);
                }),
            );

            // Exclua o documento do usuário
            await userRef.delete();

            console.log('Dados do usuário excluídos com sucesso.');
        }

        await deleteUserData(email);

        return res.status(200).json({ message: 'All data deleted' });
    }
}

export default new DeleteAll();
