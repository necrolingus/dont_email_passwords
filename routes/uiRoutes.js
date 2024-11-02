import express from 'express'
import axios from 'axios'

const uiRouter = express.Router()


function computeExpiry(ttl) {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getTime() + ttl * 1000);
    const options = {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const formattedExpiryDate = expiryDate.toLocaleString('en-GB', options);
    return formattedExpiryDate
}


uiRouter.get('/', async function(req, res) {
    res.render('home');
})

uiRouter.get('/:key', async function(req, res) {
    const key = req.params.key

    try {
        // Dynamically construct the URL based on the request
        const baseURL = `${req.protocol}://${req.get('host')}`;
        const response = await axios.get(`${baseURL}/api/secret/${key}`);
        
        const secretData = response.data;

        //compute some values
        const prettyExpiry = computeExpiry(response.data.remaining_ttl_seconds)
        const clicksLeft = secretData.expire_clicks - secretData.current_clicks;
        const remainingMinutes = Math.round(secretData.remaining_ttl_seconds / 60);
        const remainingHours = Math.round(secretData.remaining_ttl_seconds / 3600);


        return res.render('presentSecret', {
            secret: secretData.secret,
            clicksLeft,
            totalClicks: secretData.expire_clicks,
            currentClicks: secretData.current_clicks,
            remainingTTLSeconds: secretData.remaining_ttl_seconds,
            remainingMinutes,
            remainingHours,
            prettyExpiry
        });
        
        
    } catch (error) {
        if (error.status === 404){
            res.render('404');
        } else {
            res.render('bad');
        }
    }
})

export {uiRouter}