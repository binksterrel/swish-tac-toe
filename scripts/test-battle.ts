// scripts/test-battle.ts
// Lancer avec: npx tsx scripts/test-battle.ts

import dotenv from 'dotenv'
import path from 'path'

// Charger .env.local explicitement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })


async function test() {
    console.log("🟦 TEST DU MODE BATTLE...")
    
    // 1. Vérification des Variables d'Environnement
    console.log("\n1️⃣ Vérification des Clés Pusher :")
    const appId = process.env.PUSHER_APP_ID
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const secret = process.env.PUSHER_SECRET
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    console.log(` - App ID:   ${appId ? '✅ OK' : '❌ MANQUANT'}`)
    console.log(` - Key:      ${key ? '✅ OK' : '❌ MANQUANT'}`)
    console.log(` - Secret:   ${secret ? '✅ OK' : '❌ MANQUANT'}`)
    console.log(` - Cluster:  ${cluster ? '✅ OK' : '❌ MANQUANT'} (${cluster})`)

    if (!appId || !key || !secret || !cluster) {
        console.error("\n❌ ERREUR: Il manque des clés dans .env.local !")
        return
    }

    try {
        // Dynamic Imports after Env Load
        const { generateGrid } = await import('../lib/nba-data')
        const { pusherServer } = await import('../lib/pusher')

        // 2. Test Génération Grille
        console.log("\n2️⃣ Test de Génération de Grille...")
        const { rows, cols } = generateGrid('medium')
        console.log(`✅ Grille générée avec succès ! (${rows.length} lignes, ${cols.length} colonnes)`)
        
        // 3. Test Connexion Pusher
        console.log("\n3️⃣ Test de Connexion Pusher...")
        await pusherServer.trigger('debug-channel', 'debug-event', { message: 'Ceci est un test' })
        console.log("✅ Connexion Pusher RÉUSSIE ! (Message envoyé)")
        
        // 4. Test Supabase
        const { supabaseAdmin } = await import('../lib/supabase')
        console.log("\n4️⃣ Test de Connexion Supabase...")
        const { data, error } = await supabaseAdmin.from('battles').select('count').limit(1)
        if (error) {
            console.error("❌ Erreur Supabase:", error.message)
            if (error.code === '42P01') console.error("   -> La table 'battles' n'existe pas ! Avez-vous exécuté le SQL ?")
        } else {
             console.log("✅ Connexion Supabase RÉUSSIE ! (Table 'battles' accessible)")
        }

        console.log("\n🎉 DIAGNOSTIC TERMINÉ")
    } catch (e: any) {
        console.error("\n❌ ÉCHEC DU TEST :", e)
        if (e.message) console.error("Message d'erreur :", e.message)
    }
}

test()
