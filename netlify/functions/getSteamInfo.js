const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
    const appId = event.queryStringParameters.appId;

    if (!appId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, error: 'App ID не передано!' })
        };
    }

    try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=uk`);
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data[appId])
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: 'Помилка при запиті до Steam API' })
        };
    }
};
