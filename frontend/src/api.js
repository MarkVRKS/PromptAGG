import axios from 'axios';

// локальный бэк fastapi
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
});

// --------------
// api для постов
// --------------

export const getPosts = (projectId = 'mns') =>
    api.get('/content-plan/', { params: { project_id: projectId } });

export const createPost = (postData) =>
    api.post('/content-plan/', postData);

export const updatePost = (postId, postData) =>
    api.put(`/content-plan/${postId}`, postData);

export const deletePost = (postId) =>
    api.delete(`/content-plan/${postId}`);

// -------------------
// api для багажа идей
// -------------------

export const getIdeas = (projectId = 'mns') =>
    api.get('/content-plan/ideas/', { params: { project_id: projectId } });

export const createIdea = (ideaData) =>
    api.post('/content-plan/ideas/', ideaData);

export const deleteIdea = (ideaId) =>
    api.delete(`/content-plan/ideas/${ideaId}`);

// ---------------------------
// api для библиотеки промптов
// ---------------------------

export const getLibrary = () =>
    api.get('/content-plan/library/');

export const createLibraryPrompt = (promptData) =>
    api.post('/content-plan/library/', promptData);

export const deleteLibraryPrompt = (promptId) =>
    api.delete(`/content-plan/library/${promptId}`);

export default {
    getPosts, createPost, updatePost, deletePost,
    getIdeas, createIdea, deleteIdea,
    getLibrary, createLibraryPrompt, deleteLibraryPrompt
};