def calculate_performance(kills: int, deaths: int, assists: int, headshots: int):
    safe_deaths = deaths if deaths > 0 else 1
    kda_ratio = (kills + assists) / safe_deaths
    hs_ratio = headshots / kills if kills > 0 else 0
    kda_score = min(100, (kda_ratio / 3.0) * 100) 
    acc_score = min(100, (hs_ratio / 0.8) * 100)
    total_score = round((kda_score * 0.7) + (acc_score * 0.3))
    
    if total_score >= 80:
        grade = "S (Excellent)"
    elif total_score >= 65:
        grade = "A (Great)"
    elif total_score >= 50:
        grade = "B (Good)"
    elif total_score >= 35:
        grade = "C (Average)"
    else:
        grade = "D (Needs Improvement)"
        
    return total_score, grade, round(kda_ratio, 2)
