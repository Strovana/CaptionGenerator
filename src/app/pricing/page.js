import PageHeaders from "../components/PageHeaders";

export default function PricingPage(){
    return(
        <div>
            <PageHeaders
              h1Text={"Hamare Daam yeh hai"}
              h2Text={"Idhar hai hamare daam"}
              />
        
            <div className="bg-white text-slate-700 rounded-lg max-w-xs mx-auto p-4 text-center">
                <h3 className="font-bold text-3xl mb-2">
                    Free*
                </h3>
                <h4 className="text-xs">
                    *Terms and Conditions applied
                </h4>
            </div>
        </div>
    );
}