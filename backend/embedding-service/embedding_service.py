#!/usr/bin/env python3
"""
JobVector Embedding Service avec all-MiniLM-L6-v2

Ce script Python montre comment intégrer un vrai modèle d'embedding
avec votre application Java Spring Boot.

Installation requise:
pip install sentence-transformers flask numpy

Usage:
python embedding_service.py
"""

from sentence_transformers import SentenceTransformer
import numpy as np
import json
from flask import Flask, request, jsonify
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialiser le modèle all-MiniLM-L6-v2
model = SentenceTransformer('all-MiniLM-L6-v2')
logger.info("Modèle all-MiniLM-L6-v2 chargé avec succès")

# Créer l'application Flask
app = Flask(__name__)

@app.route('/embed', methods=['POST'])
def generate_embedding():
    """
    Générer un embedding pour un texte donné
    """
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text or len(text.strip()) < 10:
            return jsonify({
                'error': 'Texte trop court ou vide'
            }), 400
        
        # Générer l'embedding
        embedding = model.encode(text)
        
        # Convertir en liste Python (JSON serializable)
        embedding_list = embedding.tolist()
        
        logger.info(f"Embedding généré pour un texte de {len(text)} caractères")
        
        return jsonify({
            'embedding': embedding_list,
            'dimension': len(embedding_list),
            'text_length': len(text)
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération d'embedding: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/embed_batch', methods=['POST'])
def generate_batch_embeddings():
    """
    Générer des embeddings pour plusieurs textes
    """
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts or len(texts) == 0:
            return jsonify({
                'error': 'Aucun texte fourni'
            }), 400
        
        # Générer les embeddings en batch (plus efficace)
        embeddings = model.encode(texts)
        
        # Convertir en liste de listes
        embeddings_list = [emb.tolist() for emb in embeddings]
        
        logger.info(f"Embeddings générés pour {len(texts)} textes")
        
        return jsonify({
            'embeddings': embeddings_list,
            'count': len(embeddings_list),
            'dimension': len(embeddings_list[0]) if embeddings_list else 0
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération d'embeddings batch: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/similarity', methods=['POST'])
def calculate_similarity():
    """
    Calculer la similarité cosinus entre deux textes
    """
    try:
        data = request.json
        text1 = data.get('text1', '')
        text2 = data.get('text2', '')
        
        if not text1 or not text2:
            return jsonify({
                'error': 'Deux textes sont requis'
            }), 400
        
        # Générer les embeddings
        embeddings = model.encode([text1, text2])
        
        # Calculer la similarité cosinus
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        
        logger.info(f"Similarité calculée: {similarity:.4f}")
        
        return jsonify({
            'similarity': float(similarity),
            'text1_length': len(text1),
            'text2_length': len(text2)
        })
        
    except Exception as e:
        logger.error(f"Erreur lors du calcul de similarité: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Vérifier la santé du service
    """
    return jsonify({
        'status': 'healthy',
        'model': 'all-MiniLM-L6-v2',
        'dimension': 384
    })

if __name__ == '__main__':
    print("🚀 Démarrage du service d'embedding JobVector")
    print("📊 Modèle: all-MiniLM-L6-v2")
    print("🔢 Dimension: 384")
    print("🌐 Endpoints disponibles:")
    print("   POST /embed - Générer un embedding")
    print("   POST /embed_batch - Générer des embeddings en batch")
    print("   POST /similarity - Calculer la similarité")
    print("   GET /health - Vérifier la santé")
    print("=" * 50)
    
    # Démarrer le serveur Flask
    app.run(host='0.0.0.0', port=5002, debug=False)
