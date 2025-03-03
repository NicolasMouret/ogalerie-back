// vim: foldmethod=syntax:foldlevel=1:foldnestmax=2
'use strict';

const client = require('../services/pgClient');
const APIError = require('../services/APIError');
const debug = require('debug')('datamapper');

const dataMapper = {
    /**
     * Récupération d'un utilisateur via son email
     * @param {object} loginInformations
     * @returns
     */
    async getUserByEmail(loginInformations) {
        const sqlQuery = `
        select * from get_user_by_email($1)
        ;`;

        const values = [loginInformations];
        let user;
        let error;

        try {
            const response = await client.query(sqlQuery, values);

            user = response.rows[0].get_user_by_email;

            debug(user);
            if (!user) {
                error = new APIError('Informations erronnées', 403);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        return {error, user};
    },

    /**
     * Récupération des infos de connection d'un utilisateur
     * @param {object} loginInformations
     * @returns
     */
    async signIn (loginInformations) {
        const sqlQuery = `
        select * from sign_in($1)
        ;`;

        const values = [loginInformations];
        let user;
        let error;

        try {
            const response = await client.query(sqlQuery, values);

            user = response.rows[0].sign_in;

            if (!user) {
                error = new APIError('Informations erronnées', 403);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        return {error, user};
    },

    /**
     * Ajout d'un utilisateur à la base de données
     * @param {object} user
     * @returns
     */
    async signUp (signInformations) {
        const sqlQuery = `
        select * from insert_user($1)
        ;`;
        const values = [signInformations];
        let user;
        let error;

        try {
            const response = await client.query(sqlQuery, values);

            user = response.rows[0].insert_user;

            debug(user);
            if (!user) {
                error = new APIError('Informations erronnées', 403);
            }
        }
        catch (err) {
            //if nickname already exists
            if (err.message === 'duplicate key value violates unique constraint "person_nickname_key"') {
                error = new APIError('Pseudo déjà utilisé', 403);
            } else {
            error = new APIError(err.message, 500, err);
            }
        }

        return {error, user};
    },

    /**
     * Récupère la liste des utilisateurs en fonction de leur rôle
     */
    async getUsers (role) {
        const sqlQuery = `
        select * from get_users($1)
        ;`;
        const values = [role];
        let error;
        let users;

        try {
            const response = await client.query(sqlQuery, values);

            users = response.rows.map(e => {
                return e.get_users;
            });

            debug(users);
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        return { error, users };
    },

    async getUser (id) {
        const sqlQuery = `
        select * from get_user_by_id($1)
        ;`;
        const values = [id];
        let error;
        let user;

        try {
            const response = await client.query(sqlQuery, values);

            user = response.rows[0].get_user_by_id;

            debug(user);
            if (!user) {
                error = new APIError('User not found', 404);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        return {error, user};
    },

    async getProfilPublic (id) {
        const sqlQuery = `
        select * from get_user_profil($1)
        ;`;
        const values = [id];
        let error;
        let user;

        try {
            const response = await client.query(sqlQuery, values);

            user = response.rows[0].get_user_profil;

            debug(user);
            if (!user) {
                error = new APIError('User not found', 404);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        return {error, user};
    },

    async update (newInfos) {
        const sqlQuery = `
        select * from update_person($1)
        ;`;
        const values = [newInfos];
        let error;
        let user;

        try {
            const response = await client.query(sqlQuery, values);

            user = response.rows[0];

            // TODO: ce serait mieux de ne pas le remonter
            // alors autant ne pas le faire suivre.
            delete user.hash;

            debug(user);
            if (!user) {
                error = new APIError('Informations erronnées', 403);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        return {error, user};
    },

    async delete (id) {
        const sqlQuery = `
        select * from delete_person($1)
        ;`;
        const values = [id];
        let error;
        let result;

        try {
            const response = await client.query(sqlQuery, values);

            result = response.rows[0].delete_person;

            debug(result);
            if (!result) {
                error = new APIError('Informations erronnées', 403);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        return {error, result};
    },

    async getCollections (id) {
        const queryCollections = 'select * from get_user_collections($1);';
        const queryArtworks = 'select * from get_collection_artworks($1);';
        const values = [id];
        let error, collections;

        try {
            const response = await client.query(queryCollections, values);

            collections = response.rows.map(e => e.get_user_collections);
            if (!collections) {
                error = new APIError('informations erronnées', 403);
            }
            debug(collections);

            for (let c of collections) {
                const artworks = await client.query(queryArtworks, [c.id]);

                c.artworks = artworks.rows;
            }
            debug(collections);
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        return { error, collections };
    },

    async getArtworks (id) {
        const sqlQuery = `
        select * from get_user_artworks($1)
        ;`;
        const values = [id];
        let error, artworks;

        try {
            const response = await client.query(sqlQuery, values);

            artworks = response.rows;
            if (!artworks) {
                error = new APIError('informations erronnées', 403);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        debug(artworks);

        return { error, artworks };
    },

    async getFavorites (id) {
        const sqlQuery = `
        select * from get_user_favorites($1)
        ;`;
        const values = [id];
        let error, favorites;

        try {
            const response = await client.query(sqlQuery, values);

            favorites = response.rows.map(e => {
                return e.get_user_favorites;
            });
            if (!favorites) {
                error = new APIError('informations erronnées', 403);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        debug(favorites);

        return { error, favorites };
    },

    async deleteFavorites (id) {
        const sqlQuery = `
        select * from delete_user_favorites($1)
        ;`;
        const values = [id];
        let error, result;

        try {
            const response = await client.query(sqlQuery, values);

            result = response.rows.map(e => {
                return e.get_user_result;
            });
            if (!result) {
                error = new APIError('informations erronnées', 403);
            }
        }
        catch (err) {
            error = new APIError(err.message, 500, err);
        }

        debug(result);

        return { error, result };
    },
};

module.exports = dataMapper;
